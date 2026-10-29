import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEventDate } from "../../lib/eventUtils";
import { listAdminEvents, saveEvent } from "../../lib/eventService";

const emptyForm = {
  title: "",
  type: "Technology Event",
  event_date: "",
  company_name: "",
  description: "",
  status: "draft",
};

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setEvents(await listAdminEvents());
    } catch (loadError) {
      console.error("Unable to load events:", loadError);
      setError(loadError?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEvents();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const publishedCount = useMemo(
    () => events.filter((event) => event.status === "published").length,
    [events]
  );
  const draftCount = events.length - publishedCount;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const existingEvent = events.find((item) => item.id === editingId);
      await saveEvent(formData, existingEvent);
      setNotice(editingId ? "Event changes saved." : "Event created.");
      resetForm();
      await fetchEvents();
    } catch (saveError) {
      console.error("Could not save event:", saveError);
      setError(saveError?.message || "Could not save event.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(event) {
    setEditingId(event.id);
    setFormData({
      title: event.title || "",
      type: event.type || "Technology Event",
      event_date: event.event_date || "",
      company_name: event.company_name || "",
      description: event.description || "",
      status: event.status || "draft",
    });
    setError("");
    setNotice("");
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">PUBLISH & PROMOTE</span>
          <h1>Upcoming blogs</h1>
          <p>Create and manage upcoming blog highlights shown on your homepage.</p>
        </div>
        <button
          type="button"
          className="admin-secondary-button"
          onClick={fetchEvents}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card admin-stat-card-total">
          <span>Total blogs</span>
          <strong>{events.length}</strong>
        </div>
        <div className="admin-stat-card admin-stat-card-published">
          <span>Published blogs</span>
          <strong>{publishedCount}</strong>
        </div>
        <div className="admin-stat-card admin-stat-card-draft">
          <span>Draft blogs</span>
          <strong>{draftCount}</strong>
        </div>
      </div>

      <section className="admin-panel admin-event-form">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">
              {editingId ? "UPDATE DETAILS" : "ADD TO THE CALENDAR"}
            </span>
            <h2>{editingId ? "Edit upcoming blog" : "Create upcoming blog"}</h2>
          </div>
          <span className="admin-heading-icon" aria-hidden="true">✦</span>
        </div>

        {error && <div className="admin-error" role="alert">{error}</div>}
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label className="admin-field admin-field-wide">
            <span>Event name</span>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI Infrastructure Summit"
              required
            />
          </label>

          <label className="admin-field">
            <span>Event type</span>
            <input
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g. Technology Event"
              required
            />
          </label>

          <label className="admin-field">
            <span>Date</span>
            <input
              name="event_date"
              type="date"
              value={formData.event_date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Company name</span>
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. NVIDIA, Microsoft"
              required
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What should readers know about this upcoming blog?"
              rows="4"
              required
            />
          </label>

          <label className="admin-field admin-field-status">
            <span>Visibility</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="admin-form-actions admin-field-wide">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create blog"}
            </button>
            {editingId && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel admin-events-list">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">YOUR SCHEDULE</span>
            <h2>All upcoming blogs <span className="admin-count">{events.length}</span></h2>
          </div>
        </div>

        {loading ? (
          <p className="admin-loading">Loading upcoming blogs...</p>
        ) : events.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon" aria-hidden="true">✦</span>
            <h3>Your blog schedule is ready</h3>
            <p>Create an upcoming blog above and publish it when it’s ready to appear on your homepage.</p>
          </div>
        ) : (
          <div className="admin-event-list">
            {events.map((item) => {
              const date = formatEventDate(item.event_date);
              return (
                <article className="admin-event-item" key={item.id}>
                  <div className="admin-event-date">
                    <span>{date.month}</span>
                    <strong>{date.day}</strong>
                  </div>
                  <div className="admin-event-summary">
                    <div className="admin-event-meta">
                      <span>{item.type}</span>
                      <span>{date.full}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.company_name}</p>
                  </div>
                  <span className={`admin-status admin-status-${item.status}`}>
                    {item.status}
                  </span>
                  <button
                    type="button"
                    className="admin-row-action"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default EventManagement;

import { useCallback, useEffect, useState } from "react";
import CompanyLogo from "../../components/CompanyLogo";
import {
  deleteCompany,
  listAdminCompanies,
  saveCompany,
} from "../../lib/companyService";

const emptyForm = {
  name: "",
  industry: "",
  description: "",
  website: "",
  logo_url: "",
};

function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCompanies(await listAdminCompanies());
    } catch (loadError) {
      console.error("Unable to load companies:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCompanies();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setLogoFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const existingCompany = companies.find((company) => company.id === editingId);
      await saveCompany(formData, { existingCompany, logoFile });
      setNotice(editingId ? "Company details updated." : "Company added.");
      resetForm();
      await fetchCompanies();
    } catch (saveError) {
      console.error("Could not save company:", saveError);
      setError(saveError instanceof Error ? saveError.message : "Could not save company.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(company) {
    setEditingId(company.id);
    setFormData({
      name: company.name || "",
      industry: company.industry || "",
      description: company.description || "",
      website: company.website || "",
      logo_url: company.logo_url || company.logo || "",
    });
    setLogoFile(null);
    setError("");
    setNotice("");
  }

  async function handleDelete(company) {
    if (!window.confirm(`Remove ${company.name} from the company section?`)) {
      return;
    }

    setDeletingId(company.id);
    setError("");
    setNotice("");

    try {
      await deleteCompany(company.id);
      if (editingId === company.id) {
        resetForm();
      }
      setNotice(`${company.name} removed.`);
      await fetchCompanies();
    } catch (deleteError) {
      console.error("Could not delete company:", deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete company.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">BRAND DIRECTORY</span>
          <h1>Companies</h1>
          <p>Manage the company profiles and logos shown on the homepage.</p>
        </div>
        <button
          type="button"
          className="admin-secondary-button"
          onClick={fetchCompanies}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="admin-error" role="alert">{error}</div>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-panel admin-company-form">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">{editingId ? "UPDATE PROFILE" : "ADD A COMPANY"}</span>
            <h2>{editingId ? "Edit company" : "Create company profile"}</h2>
          </div>
          <span className="admin-heading-icon" aria-hidden="true">✦</span>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Company name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. NVIDIA"
              required
            />
          </label>

          <label className="admin-field">
            <span>Industry</span>
            <input
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g. Semiconductors · AI"
              required
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>About the company</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what the company does."
              rows="4"
              required
            />
          </label>

          <label className="admin-field">
            <span>Company website</span>
            <input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com/about"
            />
          </label>

          <label className="admin-field">
            <span>Logo image URL (optional)</span>
            <input
              name="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              disabled={Boolean(logoFile)}
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Or upload a logo (JPG, PNG, WebP; max 5 MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
            />
            {logoFile && <small className="admin-company-file-name">{logoFile.name}</small>}
          </label>

          <div className="admin-form-actions admin-field-wide">
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add company"}
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

      <section className="admin-panel admin-company-list">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">HOMEPAGE DIRECTORY</span>
            <h2>All companies <span className="admin-count">{companies.length}</span></h2>
          </div>
        </div>

        {loading ? (
          <p className="admin-loading">Loading companies...</p>
        ) : companies.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No companies yet</h3>
            <p>Add a company profile above to display it on the homepage.</p>
          </div>
        ) : (
          <div className="admin-company-grid">
            {companies.map((company) => (
              <article className="admin-company-card" key={company.id}>
                <CompanyLogo company={company} />
                <div className="admin-company-card-content">
                  <h3>{company.name}</h3>
                  <span>{company.industry}</span>
                  <p>{company.description}</p>
                </div>
                <div className="admin-company-actions">
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => handleEdit(company)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-row-action admin-row-action-danger"
                    onClick={() => handleDelete(company)}
                    disabled={deletingId === company.id}
                  >
                    {deletingId === company.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CompanyManagement;

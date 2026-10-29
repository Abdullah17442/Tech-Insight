import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteArticle,
  listAdminArticles,
  saveArticle,
} from "../../lib/articleService";
import ArticleContentEditor from "../../components/admin/ArticleContentEditor";

const emptyForm = {
  title: "",
  subtitle: "",
  category: "AI Infrastructure",
  company_name: "",
  content: "",
  status: "draft",
  image_url: "",
};

function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editorVersion, setEditorVersion] = useState(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setArticles(await listAdminArticles());
    } catch (loadError) {
      console.error("Unable to load articles:", loadError);
      setError(loadError?.message || "Unable to load articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchArticles();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const publishedCount = useMemo(
    () => articles.filter((article) => article.status === "published").length,
    [articles]
  );

  const draftCount = useMemo(
    () => articles.filter((article) => article.status === "draft").length,
    [articles]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setEditorVersion((version) => version + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const existingArticle = articles.find((article) => article.id === editingId);
      await saveArticle(formData, {
        existingArticle,
        imageFile,
      });

      resetForm();
      await fetchArticles();
    } catch (saveError) {
      console.error("Could not save article:", saveError);
      setError(saveError?.message || "Could not save article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(article.id);
    setError("");
    setNotice("");

    try {
      await deleteArticle(article.id);
      if (editingId === article.id) {
        resetForm();
      }
      setNotice(`"${article.title}" was deleted.`);
      await fetchArticles();
    } catch (deleteError) {
      console.error("Could not delete article:", deleteError);
      setError(deleteError?.message || "Could not delete article.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(article) {
    const articleText = Array.isArray(article.content)
      ? article.content
          .flatMap((section) => section.paragraphs || [])
          .join("\n\n")
      : article.content || "";

    setEditingId(article.id);
    setFormData({
      title: article.title || "",
      subtitle: article.subtitle || "",
      category: article.category || "AI Infrastructure",
      company_name: article.company_name || article.company || "",
      content: articleText,
      status: article.status || "draft",
      image_url: article.image_url || "",
    });
    setImageFile(null);
    setError("");
    setEditorVersion((version) => version + 1);
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">CONTENT STUDIO</span>
          <h1>Articles</h1>
          <p>Write, publish, and manage your Tech Insight stories.</p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={fetchArticles}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card admin-stat-card-total">
          <span>Total articles</span>
          <strong>{articles.length}</strong>
        </div>

        <div className="admin-stat-card admin-stat-card-published">
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>

        <div className="admin-stat-card admin-stat-card-draft">
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </div>
      </div>

      <section className="admin-panel admin-article-form">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">{editingId ? "UPDATE STORY" : "START WRITING"}</span>
            <h2>{editingId ? "Edit article" : "Create article"}</h2>
          </div>
          <span className="admin-heading-icon" aria-hidden="true">✦</span>
        </div>

        {error && <div className="admin-error" role="alert">{error}</div>}
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <div className="admin-field admin-field-wide">
            <label>
              <span>Title</span>
              <input name="title" value={formData.title} onChange={handleChange} required />
            </label>
          </div>
          <div className="admin-field">
            <label>
              <span>Category</span>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option>AI Infrastructure</option>
                <option>Data Centers</option>
                <option>Cloud</option>
                <option>Cybersecurity</option>
                <option>Energy</option>
                <option>Networking</option>
                <option>Technology</option>
              </select>
            </label>
          </div>

          <div className="admin-field">
            <label>
              <span>Subtitle</span>
              <input name="subtitle" value={formData.subtitle} onChange={handleChange} />
            </label>
          </div>
          <div className="admin-field">
            <label>
              <span>Company name</span>
              <input name="company_name" value={formData.company_name} onChange={handleChange} />
            </label>
          </div>

          <label className="admin-field admin-field-wide">
            <span>Featured image (JPG, PNG, WebP; max 5 MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
            {formData.image_url && !imageFile && (
              <span className="admin-current-image">
                Current image: {formData.image_url}
              </span>
            )}
          </label>

          <div className="admin-field admin-field-wide">
            <span>Article content</span>
            <ArticleContentEditor
              key={editorVersion}
              value={formData.content}
              onChange={(content) =>
                setFormData((current) => ({ ...current, content }))
              }
            />
          </div>

          <label className="admin-field">
              <span>Status</span>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
          </label>

          <div className="admin-form-actions admin-field-wide">
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create article"}
            </button>

            {editingId && (
              <button type="button" className="admin-secondary-button" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-panel admin-articles-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">YOUR LIBRARY</span>
            <h2>All articles <span className="admin-count">{articles.length}</span></h2>
          </div>
        </div>

        {loading ? (
          <p>Loading articles...</p>
        ) : articles.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No articles yet</h3>
            <p>Your articles will appear here after you create them.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-articles-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="admin-article-title">{article.title}</td>
                    <td>{article.category}</td>
                    <td>
                      <span className={`admin-status admin-status-${article.status}`}>{article.status}</span>
                    </td>
                    <td>
                      {article.created_at ? new Date(article.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action"
                          onClick={() => handleEdit(article)}
                          disabled={deletingId === article.id}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-row-action admin-row-action-danger"
                          onClick={() => handleDelete(article)}
                          disabled={deletingId === article.id}
                        >
                          {deletingId === article.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteArticle,
  listAdminArticles,
  listAdminArticleDailyViewCounts,
  listAdminArticleViewCounts,
  resetAdminArticleViews,
  saveArticle,
} from "../../lib/articleService";
import { listAdminCompanies, saveCompany } from "../../lib/companyService";
import { toLocalDateTimeInput } from "../../lib/articleUtils";
import ArticleContentEditor from "../../components/admin/ArticleContentEditor";

const NEW_COMPANY_OPTION = "__new_company__";

const emptyForm = {
  title: "",
  subtitle: "",
  category: "AI Infrastructure",
  company_selection: "",
  company_name: "",
  company_industry: "",
  company_description: "",
  company_website: "",
  company_logo_url: "",
  content: "",
  status: "draft",
  published_at: "",
  image_url: "",
};

function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");
  const [dailyViews, setDailyViews] = useState([]);
  const [dailyViewsLoading, setDailyViewsLoading] = useState(true);
  const [selectedViewDate, setSelectedViewDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const dailyViewsRequestId = useRef(0);
  const [resettingViews, setResettingViews] = useState(false);
  const [companyLoadError, setCompanyLoadError] = useState("");
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
      const [articleItems, viewCounts] = await Promise.all([
        listAdminArticles(),
        listAdminArticleViewCounts(),
      ]);
      const viewsByArticleId = new Map(
        viewCounts.map(({ article_id, total_views }) => [
          article_id,
          Number(total_views),
        ])
      );
      setArticles(
        articleItems.map((article) => ({
          ...article,
          total_views: viewsByArticleId.get(article.id) || 0,
        }))
      );
    } catch (loadError) {
      console.error("Unable to load articles:", loadError);
      setError(loadError?.message || "Unable to load articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    setCompanyLoadError("");
    try {
      setCompanies(await listAdminCompanies());
    } catch (loadError) {
      console.error("Unable to load companies for article editor:", loadError);
      setCompanyLoadError(loadError?.message || "Unable to load companies.");
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const fetchDailyViews = useCallback(async () => {
    const requestId = ++dailyViewsRequestId.current;
    setAnalyticsError("");
    setDailyViewsLoading(true);
    try {
      const viewCounts =
        await listAdminArticleDailyViewCounts(selectedViewDate);
      if (requestId === dailyViewsRequestId.current) {
        setDailyViews(viewCounts);
      }
    } catch (loadError) {
      if (requestId !== dailyViewsRequestId.current) {
        return;
      }
      console.error("Unable to load daily article views:", loadError);
      setAnalyticsError(
        loadError?.message || "Unable to load daily article views."
      );
    } finally {
      if (requestId === dailyViewsRequestId.current) {
        setDailyViewsLoading(false);
      }
    }
  }, [selectedViewDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchArticles();
      void fetchCompanies();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchArticles, fetchCompanies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDailyViews();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchDailyViews]);

  const publishedCount = useMemo(
    () => articles.filter((article) => article.status === "published").length,
    [articles]
  );

  const draftCount = useMemo(
    () => articles.filter((article) => article.status === "draft").length,
    [articles]
  );

  const totalViews = useMemo(
    () => articles.reduce((total, article) => total + article.total_views, 0),
    [articles]
  );

  const dailyViewsByArticleId = useMemo(
    () =>
      new Map(
        dailyViews.map(({ article_id, total_views }) => [
          article_id,
          Number(total_views),
        ])
      ),
    [dailyViews]
  );

  const selectedDateTotalViews = useMemo(
    () =>
      dailyViews.reduce(
        (total, article) => total + Number(article.total_views),
        0
      ),
    [dailyViews]
  );

  async function handleResetViews() {
    if (
      !window.confirm(
        "Reset all lifetime and daily article view counts? This action cannot be undone."
      )
    ) {
      return;
    }

    setResettingViews(true);
    setError("");
    setAnalyticsError("");
    setNotice("");

    try {
      await resetAdminArticleViews();
      await Promise.all([fetchArticles(), fetchDailyViews()]);
      setNotice("All article view counts have been reset.");
    } catch (resetError) {
      console.error("Could not reset article views:", resetError);
      setAnalyticsError(
        resetError?.message || "Could not reset article views."
      );
    } finally {
      setResettingViews(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleCompanySelectionChange(event) {
    const companySelection = event.target.value;
    const selectedCompany = companies.find(
      (company) => String(company.id) === companySelection
    );

    if (selectedCompany) {
      setFormData((current) => ({
        ...current,
        company_selection: companySelection,
        company_name: selectedCompany.name || "",
        company_industry: selectedCompany.industry || "",
        company_description: selectedCompany.description || "",
        company_website: selectedCompany.website || "",
        company_logo_url: selectedCompany.logo_url || selectedCompany.logo || "",
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      company_selection: companySelection,
      company_name: "",
      company_industry: current.category,
      company_description: "",
      company_website: "",
      company_logo_url: "",
    }));
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
      let companyProfile = null;
      if (formData.company_selection) {
        const existingCompany =
          formData.company_selection === NEW_COMPANY_OPTION
            ? null
            : companies.find(
                (company) =>
                  String(company.id) === formData.company_selection
              );
        try {
          companyProfile = await saveCompany(
            {
              name: formData.company_name,
              industry: formData.company_industry,
              description: formData.company_description,
              website: formData.company_website,
              logo_url: formData.company_logo_url,
            },
            { existingCompany }
          );
        } catch (companyError) {
          throw new Error(
            `Could not save the company profile: ${companyError?.message || "Unknown error."}`,
            { cause: companyError }
          );
        }
      }

      try {
        await saveArticle(
          {
            ...formData,
            company_name: companyProfile?.name || "",
          },
          {
            existingArticle,
            imageFile,
          }
        );
      } catch (articleError) {
        if (companyProfile) {
          throw new Error(
            `${companyProfile.name} was saved to the company directory, but the article could not be saved: ${articleError?.message || "Unknown error."}`,
            { cause: articleError }
          );
        }
        throw articleError;
      }

      resetForm();
      await Promise.all([fetchArticles(), fetchCompanies()]);
      setNotice(
        companyProfile
          ? `${companyProfile.name} was saved to the company directory with the article.`
          : "Article saved."
      );
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
    const articleCompany = article.company_name || article.company || "";
    const existingCompany = companies.find(
      (company) =>
        company.name.trim().toLowerCase() === articleCompany.trim().toLowerCase()
    );

    setEditingId(article.id);
    setFormData({
      title: article.title || "",
      subtitle: article.subtitle || "",
      category: article.category || "AI Infrastructure",
      company_selection: existingCompany
        ? String(existingCompany.id)
        : articleCompany
          ? NEW_COMPANY_OPTION
          : "",
      company_name: existingCompany?.name || articleCompany,
      company_industry: existingCompany?.industry || article.category || "",
      company_description:
        existingCompany?.description ||
        article.subtitle ||
        (articleCompany ? `${articleCompany} technology company.` : ""),
      company_website: existingCompany?.website || "",
      company_logo_url:
        existingCompany?.logo_url || existingCompany?.logo || "",
      content: articleText,
      status: article.status || "draft",
      published_at: toLocalDateTimeInput(article.published_at),
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
          onClick={() => {
            void fetchArticles();
            void fetchCompanies();
          }}
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

        <div className="admin-stat-card admin-stat-card-views">
          <span>Total views</span>
          <strong>{totalViews.toLocaleString()}</strong>
        </div>
      </div>

      <section className="admin-panel admin-view-analytics">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">TRAFFIC</span>
            <h2>Daily article views</h2>
            <p>
              {selectedDateTotalViews.toLocaleString()} views on{" "}
              {selectedViewDate} (UTC)
            </p>
          </div>
          <div className="admin-view-analytics-controls">
            <label className="admin-view-date">
              <span>Date (UTC)</span>
              <input
                type="date"
                value={selectedViewDate}
                onChange={(event) => {
                  if (event.target.value) {
                    setSelectedViewDate(event.target.value);
                  }
                }}
              />
            </label>
            <button
              type="button"
              className="admin-secondary-button admin-reset-views-button"
              onClick={() => void handleResetViews()}
              disabled={resettingViews || loading}
            >
              {resettingViews ? "Resetting..." : "Reset all views"}
            </button>
          </div>
        </div>
        {analyticsError && (
          <div className="admin-error" role="alert">{analyticsError}</div>
        )}
        {dailyViewsLoading && <p className="admin-loading">Loading daily views...</p>}
        {notice && <p className="admin-notice" role="status">{notice}</p>}
      </section>

      <section className="admin-panel admin-article-form">
        <div className="admin-section-heading">
          <div>
            <span className="admin-kicker">{editingId ? "UPDATE STORY" : "START WRITING"}</span>
            <h2>{editingId ? "Edit article" : "Create article"}</h2>
          </div>
          <span className="admin-heading-icon" aria-hidden="true">✦</span>
        </div>

        {error && <div className="admin-error" role="alert">{error}</div>}
        {companyLoadError && (
          <div className="admin-error" role="alert">
            Company profiles could not be loaded: {companyLoadError}
          </div>
        )}
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
              <span>Company</span>
              <select
                name="company_selection"
                value={formData.company_selection}
                onChange={handleCompanySelectionChange}
                disabled={companiesLoading}
              >
                <option value="">
                  {companiesLoading ? "Loading companies..." : "No company"}
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={String(company.id)}>
                    {company.name}
                  </option>
                ))}
                <option value={NEW_COMPANY_OPTION}>Add a new company...</option>
              </select>
            </label>
          </div>

          {formData.company_selection && (
            <>
              <label className="admin-field">
                <span>Company name</span>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Industry</span>
                <input
                  name="company_industry"
                  value={formData.company_industry}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="admin-field admin-field-wide">
                <span>About the company</span>
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Company website</span>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleChange}
                />
              </label>
              <label className="admin-field">
                <span>Company logo URL</span>
                <input
                  type="url"
                  name="company_logo_url"
                  value={formData.company_logo_url}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

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
              <span>Publication</span>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Schedule publication</option>
              </select>
          </label>

          {formData.status === "scheduled" && (
            <label className="admin-field">
              <span>Publish date and time</span>
              <input
                type="datetime-local"
                name="published_at"
                value={formData.published_at}
                min={toLocalDateTimeInput(new Date())}
                onChange={handleChange}
                required
              />
            </label>
          )}

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
                  <th>Total views</th>
                  <th>Views on date</th>
                  <th>Status</th>
                  <th>Publication</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="admin-article-title">{article.title}</td>
                    <td>{article.category}</td>
                    <td>{article.total_views.toLocaleString()}</td>
                    <td>
                      {dailyViewsLoading
                        ? "—"
                        : (dailyViewsByArticleId.get(article.id) || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-status admin-status-${article.status}`}>{article.status}</span>
                    </td>
                    <td>
                      {article.published_at &&
                      ["published", "scheduled"].includes(article.status)
                        ? new Date(article.published_at).toLocaleString()
                        : article.created_at
                          ? new Date(article.created_at).toLocaleDateString()
                          : "—"}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action"
                          onClick={() => handleEdit(article)}
                          disabled={
                            deletingId === article.id || companiesLoading
                          }
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

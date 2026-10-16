import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function AdminDashboard() {
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const fetchArticles = useCallback(async () => {
setLoading(true);
setError("");


const { data, error } = await supabase
  .from("blogs")
  .select("id, title, category, status, created_at, published_at")
  .order("created_at", { ascending: false });

if (error) {
  setError(error.message);
  setArticles([]);
} else {
  setArticles(data || []);
}

setLoading(false);


}, []);

useEffect(() => {
fetchArticles();
}, [fetchArticles]);

const publishedCount = articles.filter(
(article) => article.status === "published"
).length;

const draftCount = articles.filter(
(article) => article.status === "draft"
).length;

return ( <div className="admin-dashboard"> <div className="admin-page-heading"> <div> <h1>Articles</h1> <p>Manage your Tech Insight articles.</p> </div>


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
    <div className="admin-stat-card">
      <span>Total articles</span>
      <strong>{articles.length}</strong>
    </div>

    <div className="admin-stat-card">
      <span>Published</span>
      <strong>{publishedCount}</strong>
    </div>

    <div className="admin-stat-card">
      <span>Drafts</span>
      <strong>{draftCount}</strong>
    </div>
  </div>

  <section className="admin-articles-section">
    <h2>All articles</h2>

    {loading ? (
      <p>Loading articles...</p>
    ) : error ? (
      <div className="admin-error">
        <p>Could not load articles.</p>
        <p>{error}</p>
      </div>
    ) : articles.length === 0 ? (
      <div className="admin-empty-state">
        <h3>No articles yet</h3>
        <p>
          Your articles will appear here after you create them.
        </p>
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
            </tr>
          </thead>

          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="admin-article-title">
                  {article.title}
                </td>

                <td>{article.category}</td>

                <td>
                  <span
                    className={`admin-status admin-status-${article.status}`}
                  >
                    {article.status}
                  </span>
                </td>

                <td>
                  {new Date(article.created_at).toLocaleDateString()}
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

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import blogs from "../data/blogs";
import BlogCard from "../components/BlogCard";
import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import { listPublishedArticles } from "../lib/articleService";
import "./BlogsPage.css";

function BlogsPage() {
  const [articles, setArticles] = useState(blogs);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All topics");

  useEffect(() => {
    const timer = setTimeout(() => {
      listPublishedArticles()
        .then(setArticles)
        .catch((error) => {
          console.error("Unable to load published articles:", error);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Published articles could not be refreshed from Supabase."
          );
        });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const featuredBlog = articles[0];
  const otherBlogs = articles.slice(1);
  const categories = useMemo(
    () => [...new Set(articles.map((article) => article.category).filter(Boolean))].sort(),
    [articles]
  );
  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory =
        category === "All topics" || article.category === category;
      const searchableText = [
        article.title,
        article.description,
        article.category,
        article.company,
        article.author,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        matchesCategory &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [articles, category, search]);
  const isFiltering = Boolean(search.trim()) || category !== "All topics";

  return (
    <div className="blogs-page">
      <TopBar />
      <SiteBrandBar />
      <main>
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="blogs-header">
          <div className="container">
            {loadError && <p role="status">{loadError}</p>}
            <span className="blogs-eyebrow">TECH INSIDE</span>

            <h1>Latest Blogs</h1>

            <p>
              Technology, data centers, cloud, AI infrastructure,
              cybersecurity, energy and the systems shaping the digital world.
            </p>
          </div>
        </section>

        {/* =====================================================
            FEATURED STORY
        ===================================================== */}

        {featuredBlog && !isFiltering && (
          <section className="featured-blogs">
            <div className="container">
              <article className="featured-blogs-card">
                <Link
                  to={`/blog/${featuredBlog.slug}`}
                  className="featured-blogs-image"
                >
                  {featuredBlog.image ? (
                    <img
                      src={featuredBlog.image}
                      alt={featuredBlog.title}
                    />
                  ) : (
                    <span>TECH INSIDE</span>
                  )}
                </Link>

                <div className="featured-blogs-content">
                  <Link
                    to={`/topics/${featuredBlog.category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="category"
                  >
                    {featuredBlog.category}
                  </Link>

                  <h2>
                    <Link to={`/blog/${featuredBlog.slug}`}>
                      {featuredBlog.title}
                    </Link>
                  </h2>

                  <p>{featuredBlog.description}</p>

                  <div className="featured-blogs-meta">
                    <span>{featuredBlog.type}</span>
                    <span>{featuredBlog.date}</span>
                    <span>{featuredBlog.readTime}</span>
                  </div>

                  <Link
                    to={`/blog/${featuredBlog.slug}`}
                    className="read-story"
                  >
                    Read Full Story →
                  </Link>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* =====================================================
            ALL STORIES
        ===================================================== */}

        <section className="all-blogs">
          <div className="container">
            <div className="blogs-section-heading">
              <div>
                <span>MORE FROM TECH INSIDE</span>
                <h2>All Stories</h2>
              </div>

              <span className="story-count" aria-live="polite">
                {isFiltering
                  ? `${filteredArticles.length} ${
                      filteredArticles.length === 1 ? "Story" : "Stories"
                    } found`
                  : `${articles.length} Stories`}
              </span>
            </div>

            <div className="blogs-filters" role="search">
              <label className="blogs-search">
                <span className="blogs-search-icon" aria-hidden="true">⌕</span>
                <span className="visually-hidden">Search stories</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search stories, topics, companies..."
                />
              </label>

              <label className="blogs-category-filter">
                <span className="visually-hidden">Filter by topic</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>All topics</option>
                  {categories.map((topic) => (
                    <option key={topic}>{topic}</option>
                  ))}
                </select>
              </label>

              {isFiltering && (
                <button
                  type="button"
                  className="blogs-filter-reset"
                  onClick={() => {
                    setSearch("");
                    setCategory("All topics");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="blogs-grid">
              {(isFiltering ? filteredArticles : otherBlogs).map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                />
              ))}
            </div>

            {(isFiltering ? filteredArticles.length === 0 : articles.length === 0) && (
              <div className="no-blogs">
                <h2>{isFiltering ? "No matching stories" : "No Stories Yet"}</h2>
                <p>
                  {isFiltering
                    ? "Try another search or clear the selected topic."
                    : "New Tech Inside stories will appear here soon."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default BlogsPage;
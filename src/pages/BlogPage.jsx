import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import blogs from "../data/blogs";
import { listPublishedArticles } from "../lib/articleService";
import { sanitizeArticleHtml } from "../lib/articleUtils";
import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";
import "./BlogPage.css";

function BlogPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState(blogs);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      listPublishedArticles()
        .then((items) => {
          if (active) {
            setArticles(items);
          }
        })
        .catch((error) => {
          console.error("Unable to load published articles:", error);
          if (active) {
            setLoadError(
              error instanceof Error
                ? error.message
                : "The published article could not be loaded from Supabase."
            );
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const blog = articles.find((item) => item.slug === slug);
  const relatedArticles = useMemo(() => {
    if (!blog) {
      return [];
    }

    const sameCategory = articles.filter(
      (item) => item.slug !== blog.slug && item.category === blog.category
    );
    const recommendations = sameCategory.length
      ? sameCategory
      : articles.filter((item) => item.slug !== blog.slug);
    return recommendations.slice(0, 3);
  }, [articles, blog]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    function updateReadingProgress() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    }

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, [slug]);

  async function handleShare() {
    setShareMessage("");
    const articleUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: articleUrl,
        });
        setShareMessage("Article shared.");
        return;
      }

      await navigator.clipboard.writeText(articleUrl);
      setShareMessage("Article link copied.");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Could not share article:", error);
      setShareMessage(
        "Sharing is unavailable here. Copy the page URL from your browser."
      );
    }
  }

  if (!blog) {
    if (loading) {
      return <main className="blog-not-found"><p>Loading article...</p></main>;
    }

    return (
      <div className="site">
        <SiteBrandBar />
        <main className="blog-not-found">
          <h1>Article Not Found</h1>
          <p>{loadError || "The article you're looking for does not exist."}</p>
          <Link to="/blogs">← Back to Blogs</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="site">
      <SiteBrandBar />
      <main className="blog-page">
        <div className="blog-reading-progress" aria-hidden="true">
          <span style={{ width: `${readingProgress}%` }} />
        </div>
        <article>
          <div className="container">
            <div className="blog-header">
              <Link
                to={`/topics/${blog.category
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="blog-category"
              >
                {blog.category}
              </Link>

              <h1>{blog.title}</h1>

              <p className="blog-description">
                {blog.description}
              </p>

              <div className="blog-meta">
                <span>By {blog.author}</span>
                <span>{blog.date}</span>
                <span>{blog.readTime}</span>
              </div>

              <div className="blog-actions">
                <button type="button" onClick={handleShare}>
                  <span aria-hidden="true">↗</span> Share article
                </button>
                {shareMessage && (
                  <span className="blog-share-message" role="status">
                    {shareMessage}
                  </span>
                )}
              </div>
            </div>

            <div className="blog-hero-image">
              <img src={blog.image} alt={blog.title} />
            </div>

            <div className="blog-content">
              {(Array.isArray(blog.content) ? blog.content : []).map((section, index) => (
                <section key={index}>
                  <h2>{section.heading}</h2>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <div
                      className="blog-rich-text"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeArticleHtml(paragraph),
                      }}
                      key={paragraphIndex}
                    />
                  ))}
                </section>
              ))}
            </div>

            {relatedArticles.length > 0 && (
              <section className="blog-related" aria-labelledby="related-heading">
                <div className="blog-related-heading">
                  <div>
                    <span>KEEP EXPLORING</span>
                    <h2 id="related-heading">More stories for you</h2>
                  </div>
                  <Link to="/blogs">View all blogs <span aria-hidden="true">→</span></Link>
                </div>
                <div className="blog-related-grid">
                  {relatedArticles.map((article) => (
                    <Link
                      className="blog-related-card"
                      to={`/blog/${article.slug}`}
                      key={article.id}
                    >
                      {article.image && (
                        <div className="blog-related-image">
                          <img src={article.image} alt="" loading="lazy" />
                          <span className="blog-related-category">{article.category}</span>
                        </div>
                      )}
                      <div className="blog-related-copy">
                        {!article.image && (
                          <span className="blog-related-category">{article.category}</span>
                        )}
                        <h3>{article.title}</h3>
                        <p>{article.description}</p>
                        <strong>Read story <span aria-hidden="true">→</span></strong>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="blog-back">
              <Link to="/blogs">← Back to Latest Blogs</Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default BlogPage;
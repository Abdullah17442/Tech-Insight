import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import blogs from "../data/blogs";
import BlogCard from "../components/BlogCard";
import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import { listPublishedArticles } from "../lib/articleService";
import "./TopicPage.css";

function TopicPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState(blogs);
  const [loadError, setLoadError] = useState("");

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

  const topicName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  const topicBlogs = articles.filter(
    (blog) =>
      blog.category.toLowerCase().replace(/\s+/g, "-") === slug
  );

  return (
    <div className="topic-page">
      <TopBar />
      <SiteBrandBar />
      <main>
        {/* =====================================================
            TOPIC HEADER
        ===================================================== */}

        <section className="topic-header">
          <div className="container">
            <Link to="/news" className="topic-back">
              ← Back to News
            </Link>

            <span className="topic-eyebrow">
              TOPIC
            </span>

            <h1>{topicName}</h1>
            {loadError && <p role="status">{loadError}</p>}

            <p>
              Explore the latest Tech Inside stories,
              analysis and explainers about {topicName}.
            </p>
          </div>
        </section>

        {/* =====================================================
            TOPIC STORIES
        ===================================================== */}

        <section className="topic-stories">
          <div className="container">
            <div className="topic-section-heading">
              <div>
                <span>TECH INSIDE</span>
                <h2>Stories</h2>
              </div>

              <span className="topic-count">
                {topicBlogs.length}{" "}
                {topicBlogs.length === 1 ? "Story" : "Stories"}
              </span>
            </div>

            {topicBlogs.length > 0 ? (
              <div className="topic-grid">
                {topicBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                  />
                ))}
              </div>
            ) : (
              <div className="topic-empty">
                <h2>No Stories Found</h2>

                <p>
                  We haven't published any stories under this
                  topic yet.
                </p>

                <Link to="/news">
                  Explore Latest News →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TopicPage;
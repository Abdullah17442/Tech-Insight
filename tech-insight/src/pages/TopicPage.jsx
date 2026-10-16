import { Link, useParams } from "react-router-dom";
import blogs from "../data/blogs";
import BlogCard from "../components/BlogCard";
import "./TopicPage.css";

function TopicPage() {
  const { slug } = useParams();

  const topicName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  const topicBlogs = blogs.filter(
    (blog) =>
      blog.category.toLowerCase().replace(/\s+/g, "-") === slug
  );

  return (
    <div className="topic-page">
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
    </div>
  );
}

export default TopicPage;
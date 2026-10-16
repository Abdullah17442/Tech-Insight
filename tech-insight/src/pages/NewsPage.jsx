import { Link } from "react-router-dom";
import blogs from "../data/blogs";
import BlogCard from "../components/BlogCard";
import "./NewsPage.css";

function NewsPage() {
  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);

  return (
    <div className="news-page">
      <main>
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="news-header">
          <div className="container">
            <span className="news-eyebrow">TECH INSIDE</span>

            <h1>Latest News</h1>

            <p>
              Technology, data centers, cloud, AI infrastructure,
              cybersecurity, energy and the systems shaping the digital world.
            </p>
          </div>
        </section>

        {/* =====================================================
            FEATURED STORY
        ===================================================== */}

        {featuredBlog && (
          <section className="featured-news">
            <div className="container">
              <article className="featured-news-card">
                <Link
                  to={`/blog/${featuredBlog.slug}`}
                  className="featured-news-image"
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

                <div className="featured-news-content">
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

                  <div className="featured-news-meta">
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

        <section className="all-news">
          <div className="container">
            <div className="news-section-heading">
              <div>
                <span>MORE FROM TECH INSIDE</span>
                <h2>All Stories</h2>
              </div>

              <span className="story-count">
                {blogs.length} Stories
              </span>
            </div>

            <div className="news-grid">
              {otherBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                />
              ))}
            </div>

            {blogs.length === 0 && (
              <div className="no-news">
                <h2>No Stories Yet</h2>
                <p>
                  New Tech Inside stories will appear here soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default NewsPage;
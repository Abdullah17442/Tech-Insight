import { Link, useParams } from "react-router-dom";
import blogs from "../data/blogs";
import "./BlogPage.css";

function BlogPage() {
  const { slug } = useParams();

  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    return (
      <div className="site">
        <main className="blog-not-found">
          <h1>Article Not Found</h1>
          <p>The article you're looking for does not exist.</p>
          <Link to="/news">← Back to News</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="site">
      <main className="blog-page">
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
            </div>

            <div className="blog-hero-image">
              <img src={blog.image} alt={blog.title} />
            </div>

            <div className="blog-content">
              {blog.content.map((section, index) => (
                <section key={index}>
                  <h2>{section.heading}</h2>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <div className="blog-back">
              <Link to="/news">← Back to Latest Stories</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default BlogPage;
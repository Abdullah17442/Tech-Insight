import { Link } from "react-router-dom";
import "./BlogCard.css";

function BlogCard({ blog }) {
  return (
    <article className="blog-card">
      <Link
        to={`/blog/${blog.slug}`}
        className="blog-card-image"
      >
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
          />
        ) : (
          <span>TECH INSIDE</span>
        )}
      </Link>

      <div className="blog-card-content">
        <Link
          to={`/topics/${blog.category
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          className="blog-card-category"
        >
          {blog.category}
        </Link>

        <h3>
          <Link to={`/blog/${blog.slug}`}>
            {blog.title}
          </Link>
        </h3>

        <p>{blog.description}</p>

        <div className="blog-card-meta">
          <span>{blog.type}</span>
          <span>{blog.date}</span>
          <span>{blog.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
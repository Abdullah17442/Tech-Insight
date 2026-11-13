import { Link } from "react-router-dom";

const topics = [
  { number: "01", title: "Data Centers", slug: "data-centers" },
  { number: "02", title: "AI Infrastructure", slug: "ai-infrastructure" },
  { number: "03", title: "Cloud", slug: "cloud" },
  { number: "04", title: "Cybersecurity", slug: "cybersecurity" },
  { number: "05", title: "Energy", slug: "energy" },
  { number: "06", title: "Networking", slug: "networking" },
  { number: "07", title: "Technology", slug: "technology" },
];

function TopicsDropdown() {
  return (
    <div className="nav-dropdown">
      <button
        aria-haspopup="true"
        className="nav-dropdown-btn"
        type="button"
      >
        Topics
        <span className="dropdown-arrow" aria-hidden="true" />
      </button>
      <div className="dropdown-menu">
        {topics.map(({ number, title, slug }) => (
          <Link key={slug} to={`/topics/${slug}`}>
            <span>{number}</span>
            {title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopicsDropdown;

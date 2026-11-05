import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import CompanyLogo from "../components/CompanyLogo";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import TopicsDropdown from "../components/TopicsDropdown";
import blogs from "../data/blogs";
import companies from "../data/companies";
import {
  listPublishedArticles,
  listUpcomingArticles,
} from "../lib/articleService";
import { listPublishedCompanies } from "../lib/companyService";
import { listPublishedEvents } from "../lib/eventService";
import { formatEventDate, getLocalDateString } from "../lib/eventUtils";

function Home() {
const [articles, setArticles] = useState(blogs);
const [articleLoadError, setArticleLoadError] = useState("");
const [companyItems, setCompanyItems] = useState(companies);
const [showAllCompanies, setShowAllCompanies] = useState(false);
const [companyLoadError, setCompanyLoadError] = useState("");
const [upcomingEvents, setUpcomingEvents] = useState([]);
const [upcomingArticles, setUpcomingArticles] = useState([]);
const [upcomingArticlesError, setUpcomingArticlesError] = useState("");
const [upcomingArticlesLoading, setUpcomingArticlesLoading] = useState(true);
const [eventLoadError, setEventLoadError] = useState("");
const [eventsLoading, setEventsLoading] = useState(true);
const latestBlog = articles[0];

useEffect(() => {
const timer = setTimeout(() => {
  listPublishedArticles()
    .then(setArticles)
    .catch((error) => {
      console.error("Unable to load published articles:", error);
      setArticleLoadError(
        error instanceof Error
          ? error.message
          : "Published articles could not be refreshed from Supabase."
      );
    });
}, 0);

return () => clearTimeout(timer);
}, []);

useEffect(() => {
const timer = setTimeout(() => {
  listUpcomingArticles()
    .then(setUpcomingArticles)
    .catch((error) => {
      console.error("Unable to load scheduled articles:", error);
      setUpcomingArticlesError(
        error instanceof Error
          ? error.message
          : "Scheduled articles could not be refreshed."
      );
    })
    .finally(() => setUpcomingArticlesLoading(false));
}, 0);

return () => clearTimeout(timer);
}, []);

useEffect(() => {
const timer = setTimeout(() => {
  listPublishedCompanies()
    .then(setCompanyItems)
    .catch((error) => {
      console.error("Unable to load companies:", error);
      setCompanyLoadError(
        error instanceof Error ? error.message : "Companies could not be refreshed."
      );
    });
}, 0);

return () => clearTimeout(timer);
}, []);

useEffect(() => {
const timer = setTimeout(() => {
  listPublishedEvents()
    .then(setUpcomingEvents)
    .catch((error) => {
      console.error("Unable to load upcoming blogs:", error);
      setEventLoadError(
        error instanceof Error
          ? error.message
          : "Upcoming blogs could not be refreshed."
      );
    })
    .finally(() => {
      setEventsLoading(false);
    });
}, 0);

return () => clearTimeout(timer);
}, []);

return ( <div className="site">
<TopBar />

  {/* HEADER / NAVIGATION */}
  <header className="site-header">
    <div className="container header-inner">
      <BrandLogo className="logo" transparent />

      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/blogs">Blogs</Link>

        <TopicsDropdown />

        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
      </nav>
    </div>
  </header>

  {/* HOME / HERO */}
  <section className="hero" id="home">
    <div className="container hero-grid">
      <div>
        <span className="eyebrow">
          Technology · Infrastructure · Intelligence
        </span>

        <h1>
          The Technology
          <br />
          Behind The
          <br />
          <span>Digital World.</span>
        </h1>

        <p className="hero-description">
          Tech Inside explores the infrastructure, companies
          and technologies powering the modern digital economy
          — from data centers and AI systems to cloud, energy,
          networking and cybersecurity.
        </p>
      </div>

      <div className="hero-side">
        <p>
          We don't just report what technology does. We explain
          how it works, what infrastructure it needs, who is
          building it and why it matters.
        </p>

        <Link to="/blogs" className="hero-link">
          Explore Latest Blogs →
        </Link>
      </div>
    </div>
  </section>

  {/* UPCOMING EVENTS */}
  <section className="events-section">
    <div className="container">
      <SectionHeading title="Upcoming Blogs" label="What's Coming" />

      {upcomingArticlesError && <p role="status">{upcomingArticlesError}</p>}

      {eventLoadError && <p role="status">{eventLoadError}</p>}

      <div className="events-grid">
        {upcomingArticles.map((article) => {
          const publicationDate = new Date(article.published_at);
          const date = formatEventDate(getLocalDateString(publicationDate));
          const time = new Intl.DateTimeFormat("en", {
            hour: "numeric",
            minute: "2-digit",
          }).format(publicationDate);
          return (
            <article className="event-card" key={`article-${article.id}`}>
              <div className="event-date">
                <span>{date.month}</span>
                <strong>{date.day}</strong>
              </div>

              <div className="event-content">
                <div className="event-meta">
                  <span>{article.category}</span>
                  <span>{time}</span>
                </div>

                <h3>{article.title}</h3>
                <p>{article.description}</p>
              </div>
            </article>
          );
        })}

        {upcomingEvents.map((event) => {
          const date = formatEventDate(event.event_date);
          return (
            <article className="event-card" key={event.id}>
              <div className="event-date">
                <span>{date.month}</span>
                <strong>{date.day}</strong>
              </div>

              <div className="event-content">
                <div className="event-meta">
                  <span>{event.type}</span>
                  <span>{event.company_name}</span>
                </div>

                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </article>
          );
        })}
      </div>
      {!eventsLoading &&
        !upcomingArticlesLoading &&
        !eventLoadError &&
        !upcomingArticlesError &&
        upcomingEvents.length === 0 &&
        upcomingArticles.length === 0 && (
        <p className="events-empty-state">No events scheduled right now. Check back soon.</p>
      )}
    </div>
  </section>

  {/* DATA CENTER SPOTLIGHT */}
  <section className="spotlight" id="datacenters">
    <div className="container">
      <SectionHeading title="Latest Blog" label="Core Coverage" />

      <div className="spotlight-grid">
        <div className={`spotlight-main${latestBlog?.image ? " spotlight-main-with-image" : ""}`}>
          {latestBlog?.image && (
            <img className="spotlight-image" src={latestBlog.image} alt="" />
          )}
          {latestBlog ? (
            <>
              <span className="category">{latestBlog.category}</span>
              <h3>
                <Link to={`/blog/${latestBlog.slug}`}>{latestBlog.title}</Link>
              </h3>
              <p>{latestBlog.description}</p>
              <div className="spotlight-meta">
                <span>{latestBlog.date}</span>
                <span>{latestBlog.readTime}</span>
              </div>
              <Link className="spotlight-link" to={`/blog/${latestBlog.slug}`}>
                Read the latest blog <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <span className="category">Latest Blog</span>
              <h3>New stories are on the way</h3>
              <p>Published articles will appear here as soon as they are available.</p>
            </>
          )}
        </div>

        <div className="spotlight-stat">
          <span className="number">24/7</span>
          <strong>Digital Infrastructure</strong>

          <p>
            Modern digital services depend on physical
            infrastructure operating continuously — power,
            cooling, networking and compute.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* RECENT BLOGS */}
  <section className="latest" id="blogs">
    <div className="container">
      <SectionHeading
        title="Recent Blogs"
        label="Insights & Analysis"
      />

      {articleLoadError && <p role="status">{articleLoadError}</p>}

      <div className="story-grid">
        {articles.slice(0, 3).map((blog) => (
          <article className="story-card" key={blog.id}>
            <div className="story-image">
              {blog.image ? (
                <img src={blog.image} alt={blog.title} />
              ) : (
                <span>TECH</span>
              )}
            </div>

            <Link to={`/blog/${blog.slug}`} className="story-content">
              <span className="category">{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.description}</p>

              <div className="meta">
                <span>{blog.type}</span>
                <span>{blog.readTime}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* COMPANIES */}
  <section className="companies-section" id="companies">
    <div className="container">
      <SectionHeading
        title="Companies"
        label="Behind The Technology"
      />

      <div className="companies-intro">
        <p>
          The technology we cover is built, operated and supported
          by companies around the world. Explore the organizations
          behind the infrastructure and technologies featured in
          our stories.
        </p>
      </div>

      {companyLoadError && <p className="company-load-error" role="status">{companyLoadError}</p>}
      <div className="company-grid">
        {(showAllCompanies ? companyItems : companyItems.slice(0, 3)).map((company) => (
          <article className="company-card" key={company.id}>
            <div className="company-card-header">
              <CompanyLogo company={company} />

              <span className="company-label">COMPANY</span>
            </div>

            <h3>{company.name}</h3>
            <p className="company-industry">{company.industry}</p>
            <p className="company-description">{company.description}</p>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="company-link"
              >
                Read About {company.name} →
              </a>
            )}
          </article>
        ))}
      </div>
      {companyItems.length > 3 && (
        <button
          type="button"
          className="company-show-more"
          aria-expanded={showAllCompanies}
          onClick={() => setShowAllCompanies((shown) => !shown)}
        >
          {showAllCompanies ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  </section>

  {/* ABOUT */}
  <section className="about-section" id="about">
    <div className="container">
      <SectionHeading title="About Tech Insight" label="Who We Are" />

      <div className="about-grid">
        <div className="about-main">
          <span className="category">Technology Publication</span>

          <h2>
            Understanding The Systems Behind The Digital World.
          </h2>

          <p>
            Tech Inside is a technology publication focused on
            the infrastructure, systems and businesses that power
            the modern digital economy.
          </p>

          <p>
            We cover data centers, artificial intelligence, cloud
            computing, cybersecurity, networking, energy and
            emerging technologies — with a focus on explaining
            how these systems actually work.
          </p>
        </div>

        <div className="about-side">
          <div className="about-item">
            <span>01</span>
            <div>
              <strong>Explain</strong>
              <p>
                Break down complex technology into understandable
                ideas.
              </p>
            </div>
          </div>

          <div className="about-item">
            <span>02</span>
            <div>
              <strong>Analyze</strong>
              <p>
                Look beyond headlines to understand technology
                trends.
              </p>
            </div>
          </div>

          <div className="about-item">
            <span>03</span>
            <div>
              <strong>Track</strong>
              <p>
                Follow the infrastructure and companies shaping
                the future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Footer id="contact" />
</div>

);
}

/* =========================================================
REUSABLE COMPONENTS
========================================================= */

function SectionHeading({ title, label }) {
return ( <div className="section-heading"> <h2>{title}</h2> <span>{label}</span> </div>
);
}

export default Home;

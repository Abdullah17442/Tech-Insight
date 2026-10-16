import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import blogs from "../data/blogs";
import companies from "../data/companies";
import { supabase } from "../lib/supabaseClient";

function Home() {
const [email, setEmail] = useState("");
const [newsletterMessage, setNewsletterMessage] = useState("");
const [newsletterStatus, setNewsletterStatus] = useState("");
const [newsletterLoading, setNewsletterLoading] = useState(false);

const upcomingEvents = [
{
date: "OCT 15",
type: "Technology Event",
title: "AI Infrastructure Summit 2026",
location: "Global",
description:
"A look at the companies, technologies and infrastructure shaping the next generation of AI systems.",
},
{
date: "OCT 22",
type: "Data Center Event",
title: "Data Center Infrastructure Forum",
location: "Global",
description:
"Industry leaders discuss data centers, power, cooling, networking and the future of digital infrastructure.",
},
{
date: "NOV 05",
type: "Industry Event",
title: "Cloud & Digital Infrastructure Conference",
location: "Global",
description:
"Exploring cloud infrastructure, connectivity, compute capacity and the evolving digital economy.",
},
];

const topics = [
{ number: "01", title: "Data Centers" },
{ number: "02", title: "AI Infrastructure" },
{ number: "03", title: "Cloud" },
{ number: "04", title: "Cybersecurity" },
{ number: "05", title: "Energy" },
{ number: "06", title: "Networking" },
{ number: "07", title: "Technology" },
];

async function handleNewsletterSubmit(event) {
event.preventDefault();

const normalizedEmail = email.trim().toLowerCase();

if (!normalizedEmail) {
  setNewsletterStatus("error");
  setNewsletterMessage("Please enter your email address.");
  return;
}

setNewsletterLoading(true);
setNewsletterMessage("");
setNewsletterStatus("");

try {
  const { data, error } = await supabase.functions.invoke(
    "subscribe-newsletter",
    {
      body: { email: normalizedEmail },
    }
  );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  setNewsletterStatus("success");
  setNewsletterMessage(
    data?.message ||
      "Please check your inbox for a confirmation email."
  );
  setEmail("");
} catch (error) {
  console.error("Newsletter subscription failed:", error);

  setNewsletterStatus("error");
  setNewsletterMessage(
    error instanceof Error
      ? error.message
      : "Something went wrong. Please try again."
  );
} finally {
  setNewsletterLoading(false);
}


}

return ( <div className="site">
{/* TOP BAR */} <div className="top-bar"> <div className="container top-bar-inner"> <span>TECH INSIDE — UNDERSTANDING THE DIGITAL WORLD</span> <span>DATA CENTERS · AI · CLOUD · INFRASTRUCTURE</span> </div> </div>

```
  {/* HEADER / NAVIGATION */}
  <header className="site-header">
    <div className="container header-inner">
      <Link to="/" className="logo">
        <div className="logo-mark">TI</div>
        <div className="logo-text">
          TECH INSIDE
          <small>TECHNOLOGY &amp; INFRASTRUCTURE</small>
        </div>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/news">News</Link>

        <div className="nav-dropdown">
          <button className="nav-dropdown-btn" type="button">
            Topics
            <span className="dropdown-arrow">⌄</span>
          </button>

          <div className="dropdown-menu">
            {topics.map((topic) => (
              <Link
                to={`/topics/${topic.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                key={topic.number}
              >
                <span>{topic.number}</span>
                {topic.title}
              </Link>
            ))}
          </div>
        </div>

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

        <Link to="/news" className="hero-link">
          Explore Latest News →
        </Link>
      </div>
    </div>
  </section>

  {/* UPCOMING EVENTS */}
  <section className="events-section">
    <div className="container">
      <SectionHeading title="Upcoming Events" label="What's Coming" />

      <div className="events-grid">
        {upcomingEvents.map((event) => (
          <article className="event-card" key={event.title}>
            <div className="event-date">
              <span>{event.date.split(" ")[0]}</span>
              <strong>{event.date.split(" ")[1]}</strong>
            </div>

            <div className="event-content">
              <div className="event-meta">
                <span>{event.type}</span>
                <span>{event.location}</span>
              </div>

              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* DATA CENTER SPOTLIGHT */}
  <section className="spotlight" id="datacenters">
    <div className="container">
      <SectionHeading title="Latest Blog" label="Core Coverage" />

      <div className="spotlight-grid">
        <div className="spotlight-main">
          <span className="category">Featured Infrastructure</span>

          <h3>
            Inside The Infrastructure Powering The Digital Economy
          </h3>

          <p>
            Explore how hyperscale, colocation, enterprise and
            AI-focused facilities are designed, powered, cooled
            and connected.
          </p>
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

  {/* LATEST STORIES / NEWS */}
  <section className="latest" id="news">
    <div className="container">
      <SectionHeading
        title="Latest Stories"
        label="What's Happening Now"
      />

      <div className="story-grid">
        {blogs.slice(0, 3).map((blog) => (
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
  <section className="companies-section">
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

      <div className="company-grid">
        {companies.map((company) => (
          <article className="company-card" key={company.id}>
            <div className="company-card-header">
              <div className="company-logo">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                  />
                ) : (
                  <span>{company.name.charAt(0)}</span>
                )}
              </div>

              <span className="company-label">COMPANY</span>
            </div>

            <h3>{company.name}</h3>
            <p className="company-industry">{company.industry}</p>

            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="company-link"
            >
              Read About {company.name} →
            </a>
          </article>
        ))}
      </div>
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

  {/* NEWSLETTER */}
  <section className="newsletter">
    <div className="container newsletter-inner">
      <div>
        <h2>
          Understand
          <br />
          What's Next.
        </h2>

        <p>
          Get the latest technology infrastructure stories,
          explainers and analysis from Tech Inside.
        </p>
      </div>

      <form
        className="newsletter-form"
        onSubmit={handleNewsletterSubmit}
      >
        <input
          type="email"
          placeholder="Enter your email address"
          aria-label="Email address"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={newsletterLoading}
        />

        <button type="submit" disabled={newsletterLoading}>
          {newsletterLoading ? "Sending..." : "Subscribe"}
        </button>

        {newsletterMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`newsletter-message ${
              newsletterStatus === "error"
                ? "newsletter-message-error"
                : "newsletter-message-success"
            }`}
          >
            {newsletterMessage}
          </p>
        )}
      </form>
    </div>
  </section>

  {/* FOOTER / CONTACT */}
  <footer id="contact">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-mark">TI</div>

            <div className="logo-text">
              TECH INSIDE
              <small>TECHNOLOGY &amp; INFRASTRUCTURE</small>
            </div>
          </div>

          <p>
            Understanding the technology, infrastructure and
            businesses powering the digital world.
          </p>
        </div>

        <FooterColumn
          title="Coverage"
          links={[
            "Data Centers",
            "AI Infrastructure",
            "Cloud",
            "Cybersecurity",
            "Energy",
          ]}
        />

        <FooterColumn
          title="Explore"
          links={["Companies", "Latest Stories"]}
        />

        <div className="footer-contact">
          <h4>Contact</h4>

          <p>
            Have a story, correction, partnership idea or question?
          </p>

          <a href="mailto:contact@techinside.com">
            contact@techinside.com
          </a>

          <Link to="/about">About Tech Inside →</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Tech Inside. All rights reserved.</span>
        <span>Privacy · Terms · Disclaimer</span>
      </div>
    </div>
  </footer>
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

function FooterColumn({ title, links }) {
return ( <div> <h4>{title}</h4>


  <ul>
    {links.map((link) => (
      <li key={link}>
        <a href="#">{link}</a>
      </li>
    ))}
  </ul>
</div>

);
}

export default Home;

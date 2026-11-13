import { Link } from "react-router-dom";
import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import "./ContactPage.css";

function ContactPage() {
  return (
    <div className="contact-page">
      <TopBar />
      <SiteBrandBar />
      <main>
        {/* =====================================================
            CONTACT HERO
        ===================================================== */}

        <section className="contact-hero">
          <div className="container">
            <span className="contact-eyebrow">
              CONTACT TECH INSIDE
            </span>

            <h1>
              Let's talk
              <br />
              <span>technology.</span>
            </h1>

            <p>
              Have a story, correction, partnership idea or question?
              We'd like to hear from you.
            </p>
          </div>
        </section>

        {/* =====================================================
            CONTACT INFORMATION
        ===================================================== */}

        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              {/* Contact information */}

              <div className="contact-info">
                <span className="contact-label">
                  GET IN TOUCH
                </span>

                <h2>
                  Reach
                  <br />
                  Tech Inside.
                </h2>

                <p>
                  Whether you have a technology story to share,
                  want to discuss a collaboration or simply have
                  a question, you can reach out to us directly.
                </p>

                <div className="contact-email">
                  <span>Email</span>

                  <a href="mailto:contact@techinside.com">
                    contact@techinside.com
                  </a>
                </div>
              </div>

              {/* Contact links */}

              <div className="contact-options">
                <a
                  href="mailto:contact@techinside.com"
                  className="contact-option"
                >
                  <span>01</span>

                  <div>
                    <h3>General Inquiries</h3>

                    <p>
                      Questions about Tech Inside,
                      our coverage or the website.
                    </p>
                  </div>

                  <strong>→</strong>
                </a>

                <a
                  href="mailto:contact@techinside.com"
                  className="contact-option"
                >
                  <span>02</span>

                  <div>
                    <h3>Stories & Tips</h3>

                    <p>
                      Have a technology story,
                      announcement or tip?
                    </p>
                  </div>

                  <strong>→</strong>
                </a>

                <a
                  href="mailto:contact@techinside.com"
                  className="contact-option"
                >
                  <span>03</span>

                  <div>
                    <h3>Partnerships</h3>

                    <p>
                      Interested in working with
                      Tech Inside?
                    </p>
                  </div>

                  <strong>→</strong>
                </a>

                <a
                  href="mailto:contact@techinside.com"
                  className="contact-option"
                >
                  <span>04</span>

                  <div>
                    <h3>Corrections</h3>

                    <p>
                      Spotted an error or something
                      that needs clarification?
                    </p>
                  </div>

                  <strong>→</strong>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STORY CTA
        ===================================================== */}

        <section className="contact-cta">
          <div className="container">
            <div>
              <span>EXPLORE TECH INSIDE</span>

              <h2>
                Read the
                <br />
                latest stories.
              </h2>
            </div>

            <Link to="/blogs">
              Explore Latest Blogs →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ContactPage;
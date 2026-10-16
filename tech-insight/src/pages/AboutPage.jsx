import { Link } from "react-router-dom";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <main>
        {/* =====================================================
            ABOUT HERO
        ===================================================== */}

        <section className="about-hero">
          <div className="container">
            <span className="about-eyebrow">ABOUT TECH INSIDE</span>

            <h1>
              Technology
              <br />
              <span>Behind The World.</span>
            </h1>

            <p className="about-intro">
              Tech Inside is a technology publication focused on the
              infrastructure, systems and companies shaping the digital world.
            </p>
          </div>
        </section>

        {/* =====================================================
            OUR FOCUS
        ===================================================== */}

        <section className="about-focus">
          <div className="container">
            <div className="about-section-label">
              <span>01</span>
              <p>OUR FOCUS</p>
            </div>

            <div className="about-focus-content">
              <h2>
                We look
                <br />
                <span>behind the technology.</span>
              </h2>

              <div className="about-text">
                <p>
                  Technology is more than the products and applications
                  people interact with every day. Behind every digital
                  service are data centers, networks, cloud platforms,
                  energy systems, software and engineering teams.
                </p>

                <p>
                  Tech Inside explores those systems and the companies
                  building them. We focus on the technology that powers
                  the digital economy and the infrastructure that makes
                  modern computing possible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            COVERAGE
        ===================================================== */}

        <section className="about-coverage">
          <div className="container">
            <div className="about-section-label">
              <span>02</span>
              <p>WHAT WE COVER</p>
            </div>

            <div className="coverage-grid">
              <div className="coverage-item">
                <span>01</span>
                <h3>Data Centers</h3>
                <p>
                  Servers, facilities, cooling, power systems and
                  the infrastructure behind modern computing.
                </p>
              </div>

              <div className="coverage-item">
                <span>02</span>
                <h3>AI Infrastructure</h3>
                <p>
                  GPUs, AI systems, compute infrastructure and the
                  technology enabling the AI boom.
                </p>
              </div>

              <div className="coverage-item">
                <span>03</span>
                <h3>Cloud</h3>
                <p>
                  Cloud platforms, distributed computing and the
                  systems powering modern applications.
                </p>
              </div>

              <div className="coverage-item">
                <span>04</span>
                <h3>Cybersecurity</h3>
                <p>
                  Security technologies, threats, infrastructure
                  protection and digital resilience.
                </p>
              </div>

              <div className="coverage-item">
                <span>05</span>
                <h3>Energy</h3>
                <p>
                  The growing relationship between electricity,
                  computing and digital infrastructure.
                </p>
              </div>

              <div className="coverage-item">
                <span>06</span>
                <h3>Technology Business</h3>
                <p>
                  Companies, markets and the business decisions
                  shaping the technology industry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            EDITORIAL APPROACH
        ===================================================== */}

        <section className="about-approach">
          <div className="container">
            <div className="about-section-label">
              <span>03</span>
              <p>OUR APPROACH</p>
            </div>

            <div className="approach-grid">
              <div>
                <h2>
                  Clear.
                  <br />
                  Technical.
                  <br />
                  Independent.
                </h2>
              </div>

              <div className="approach-text">
                <p>
                  We believe technology coverage should explain how
                  things actually work.
                </p>

                <p>
                  Instead of focusing only on headlines, Tech Inside
                  aims to provide context, explain complex systems in
                  accessible language and examine the infrastructure
                  behind major technology developments.
                </p>

                <p>
                  Our goal is to help readers understand not only
                  <strong> what is happening</strong>, but also
                  <strong> why it matters</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="about-cta">
          <div className="container">
            <span>KEEP EXPLORING</span>

            <h2>
              Go deeper
              <br />
              into technology.
            </h2>

            <Link to="/news">
              Explore Latest Stories →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
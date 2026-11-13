import { Link } from "react-router-dom";
import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";
import TopBar from "../components/TopBar";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <TopBar />
      <SiteBrandBar />
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
              Tech Inside explores the infrastructure, systems, and research
              shaping the digital world—from the data centers, networks, cloud
              platforms, and energy systems behind digital services to the
              engineering teams that build them.
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
                  Behind every app, platform, and AI model are data centers,
                  networks, cloud platforms, energy systems, and engineering
                  teams. We look past product announcements to explain how
                  these systems work and why they matter.
                </p>

                <p>
                  We also follow the research methods redefining computing,
                  including machine learning, deep learning, federated
                  learning, generative AI, large language models, and agentic
                  AI systems that can plan, reason, and act. We examine how
                  these methods are built and deployed, the compute and data
                  infrastructure behind them, and the questions they raise
                  about privacy, security, reliability, and governance.
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
              <p>WHAT WE EXPLORE</p>
            </div>

            <div className="coverage-grid">
              <div className="coverage-item">
                <span>01</span>
                <h3>Digital Infrastructure</h3>
                <p>
                  Data centers, networks, cloud platforms, energy systems,
                  and the engineering that keeps digital services running.
                </p>
              </div>

              <div className="coverage-item">
                <span>02</span>
                <h3>Computing Research</h3>
                <p>
                  Machine learning, deep and federated learning, generative
                  AI, large language models, and agentic systems.
                </p>
              </div>

              <div className="coverage-item">
                <span>03</span>
                <h3>Building AI Systems</h3>
                <p>
                  How intelligent systems are developed, trained, and deployed,
                  and the compute and data infrastructure that enables them.
                </p>
              </div>

              <div className="coverage-item">
                <span>04</span>
                <h3>Real-World Applications</h3>
                <p>
                  Intelligent systems in healthcare, autonomous vehicles,
                  energy, finance, manufacturing, agriculture, education, and
                  telecommunications—improving services and solving practical
                  problems at scale.
                </p>
              </div>

              <div className="coverage-item">
                <span>05</span>
                <h3>Industries in Transition</h3>
                <p>
                  Technology at work in transportation, retail, robotics, smart
                  cities, and climate and environmental solutions.
                </p>
              </div>

              <div className="coverage-item">
                <span>06</span>
                <h3>Cybersecurity & Governance</h3>
                <p>
                  Privacy, security, reliability, and governance—and the
                  business decisions shaping how technology is built and used.
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
                  Our approach is clear, technical, and independent. We explain
                  how technology works and connect innovation to its real
                  impact.
                </p>

                <p>
                  Instead of chasing headlines, we provide context, break down
                  complex systems in accessible language, and connect research
                  and infrastructure to real-world applications.
                </p>

                <p>
                  Whether you are an engineer, researcher, student, or simply
                  curious about technology, we help you understand not only
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

            <Link to="/blogs">
              Explore Tech Inside Blogs →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AboutPage;
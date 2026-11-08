import { Link } from "react-router-dom";
import logo from "../assets/Golden_Tech_Insight_Logo_bg_removed.png.png";

function Footer({ id }) {
  return (
    <footer id={id}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-logo logo">
              <img src={logo} alt="Tech Insight — Beyond the Possible" />
            </Link>
            <p>
              Understanding the technology, infrastructure and
              businesses powering the digital world.
            </p>
          </div>

          <div>
            <h4>Coverage</h4>
            <ul>
              <li><Link to="/topics/data-centers">Data Centers</Link></li>
              <li><Link to="/topics/ai-infrastructure">AI Infrastructure</Link></li>
              <li><Link to="/topics/cloud">Cloud</Link></li>
              <li><Link to="/topics/cybersecurity">Cybersecurity</Link></li>
              <li><Link to="/topics/energy">Energy</Link></li>
            </ul>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/#companies">Companies</Link></li>
              <li><Link to="/blogs">Latest Blogs</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <p>
              Have a story, correction, partnership idea or question?
            </p>
            <a href="mailto:contact@techinside.com">
              contact@techinside.com
            </a>
            <Link to="/about">About Tech Insight →</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Tech Inside. All rights reserved.</span>
          <span>Privacy · Terms · Disclaimer</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

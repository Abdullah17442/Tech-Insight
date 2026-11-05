import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import TopicsDropdown from "./TopicsDropdown";

function SiteBrandBar() {
  return (
    <header className="site-brand-bar">
      <div className="container site-brand-bar-inner">
        <BrandLogo />
        <nav aria-label="Main navigation" className="site-brand-nav">
          <TopicsDropdown />
          <Link className="site-brand-home-link" to="/">Home</Link>
        </nav>
      </div>
    </header>
  );
}

export default SiteBrandBar;

import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

function SiteBrandBar() {
  return (
    <header className="site-brand-bar">
      <div className="container site-brand-bar-inner">
        <BrandLogo />
        <Link className="site-brand-home-link" to="/">
          Home
        </Link>
      </div>
    </header>
  );
}

export default SiteBrandBar;

import { Link } from "react-router-dom";
import logoImage from "../assets/Logo.jpeg";
import transparentLogoImage from "../assets/Logo-without-bg.png";

function BrandLogo({ to = "/", className = "", transparent = false }) {
  return (
    <Link to={to} className={`brand-logo ${className}`.trim()}>
      <img
        src={transparent ? transparentLogoImage : logoImage}
        alt="Tech Insight — Beyond the Possible"
      />
    </Link>
  );
}

export default BrandLogo;

import { Link } from "react-router-dom";
import logoImage from "../assets/Logo.jpeg";
import transparentLogoImage from "../assets/Logo-without-bg.png";
import whiteLogoImage from "../assets/White-Logo-without-bg.jfif";

function BrandLogo({ to = "/", className = "", transparent = true, white = false }) {
  return (
    <Link to={to} className={`brand-logo ${className}`.trim()}>
      <img
        src={white ? whiteLogoImage : transparent ? transparentLogoImage : logoImage}
        alt="Tech Insight — Beyond the Possible"
      />
    </Link>
  );
}

export default BrandLogo;

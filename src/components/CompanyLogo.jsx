import { useState } from "react";

function CompanyLogo({ company }) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = company.logo || company.logo_url;

  return (
    <div className="company-logo">
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt={`${company.name} logo`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-label={`${company.name} logo fallback`}>
          {company.name?.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

export default CompanyLogo;

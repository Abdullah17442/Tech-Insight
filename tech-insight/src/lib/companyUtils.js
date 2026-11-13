import { slugify } from "./articleUtils.js";

export function validateCompanyInput(company) {
  if (!company?.name?.trim()) {
    return { valid: false, message: "Company name is required." };
  }
  if (!company?.industry?.trim()) {
    return { valid: false, message: "Company industry is required." };
  }
  if (!company?.description?.trim()) {
    return { valid: false, message: "Company description is required." };
  }

  for (const [field, label] of [
    ["website", "Website"],
    ["logo_url", "Logo URL"],
  ]) {
    const value = company[field]?.trim();
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      return {
        valid: false,
        message: `${label} must be a valid HTTP or HTTPS URL.`,
      };
    }
  }

  return { valid: true, message: "" };
}

export function buildCompanyPayload(company) {
  return {
    name: company.name.trim(),
    slug: slugify(company.name),
    industry: company.industry.trim(),
    description: company.description.trim(),
    website: company.website?.trim() || null,
    logo_url: company.logo_url?.trim() || null,
  };
}

export function toCompanyViewModel(company) {
  return {
    ...company,
    logo: company.logo_url || company.logo || "",
  };
}

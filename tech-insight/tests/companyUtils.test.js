import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCompanyPayload,
  toCompanyViewModel,
  validateCompanyInput,
} from "../src/lib/companyUtils.js";
import {
  getStoredCompanies,
  removeStoredCompany,
  upsertStoredCompany,
} from "../src/lib/demoData.js";

const validCompany = {
  name: "Example Systems",
  industry: "Cloud · AI",
  description: "Builds cloud infrastructure and AI tools.",
  website: "https://example.com/about",
  logo_url: "https://example.com/logo.png",
};

test("validates company details and optional HTTP URLs", () => {
  assert.equal(validateCompanyInput(validCompany).valid, true);
  assert.match(
    validateCompanyInput({ ...validCompany, website: "javascript:alert(1)" }).message,
    /valid HTTP or HTTPS URL/
  );
  assert.equal(
    validateCompanyInput({ ...validCompany, description: " " }).message,
    "Company description is required."
  );
});

test("maps company form fields to the profile table schema", () => {
  assert.deepEqual(buildCompanyPayload(validCompany), {
    name: "Example Systems",
    slug: "example-systems",
    industry: "Cloud · AI",
    description: "Builds cloud infrastructure and AI tools.",
    website: "https://example.com/about",
    logo_url: "https://example.com/logo.png",
  });
});

test("uses a saved logo URL as the company card image", () => {
  assert.equal(
    toCompanyViewModel({ name: "Example", logo_url: "https://example.com/logo.png" }).logo,
    "https://example.com/logo.png"
  );
  assert.equal(toCompanyViewModel({ name: "Example", logo_url: null }).logo, "");
});

test("creates, updates, and removes demo company profiles", () => {
  const previousWindow = globalThis.window;
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };

  try {
    const company = {
      id: "company-test",
      name: "Example Systems",
      industry: "Cloud",
    };
    upsertStoredCompany(company);
    upsertStoredCompany({ ...company, industry: "Cloud · AI" });

    assert.equal(
      getStoredCompanies().find((item) => item.id === company.id).industry,
      "Cloud · AI"
    );
    assert.equal(removeStoredCompany(company.id), true);
    assert.equal(removeStoredCompany(company.id), false);
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

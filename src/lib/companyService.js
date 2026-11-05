import companies from "../data/companies";
import {
  getStoredCompanies,
  removeStoredCompany,
  upsertStoredCompany,
} from "./demoData";
import { uploadArticleImage } from "./articleService";
import {
  buildCompanyPayload,
  toCompanyViewModel,
  validateCompanyInput,
} from "./companyUtils";
import { demoMode, supabase } from "./supabaseClient";

const COMPANY_COLUMNS =
  "id, name, slug, industry, description, website, logo_url, created_at, updated_at";

function throwCompanyDatabaseError(error) {
  if (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /relation .*company_profiles.* does not exist/i.test(error?.message || "")
  ) {
    throw new Error(
      "The Supabase company_profiles table is missing. Apply the migration in supabase/migrations before managing companies."
    );
  }
  throw error;
}

export async function listAdminCompanies() {
  if (demoMode) {
    return getStoredCompanies().map(toCompanyViewModel);
  }

  const { data, error } = await supabase
    .from("company_profiles")
    .select(COMPANY_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    throwCompanyDatabaseError(error);
  }

  return (data || []).map(toCompanyViewModel);
}

export async function listPublishedCompanies() {
  if (demoMode) {
    const savedCompanies = getStoredCompanies();
    return [...(savedCompanies.length ? savedCompanies : companies)]
      .sort(
        (left, right) =>
          new Date(right.created_at || 0).getTime() -
          new Date(left.created_at || 0).getTime()
      )
      .map(toCompanyViewModel);
  }

  const { data, error } = await supabase
    .from("company_profiles")
    .select(COMPANY_COLUMNS)
    .order("created_at", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      console.warn(
        "Company profiles are not configured in Supabase; showing the built-in company directory."
      );
      return [...companies].map(toCompanyViewModel);
    }
    throwCompanyDatabaseError(error);
  }

  return (data?.length ? data : companies).map(toCompanyViewModel);
}

export async function saveCompany(company, { existingCompany, logoFile } = {}) {
  const validation = validateCompanyInput(company);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const payload = buildCompanyPayload(company);
  if (logoFile) {
    const uploaded = await uploadArticleImage(logoFile);
    payload.logo_url = uploaded.publicUrl;
  }

  if (demoMode) {
    return upsertStoredCompany({
      ...payload,
      logo: payload.logo_url,
      id: existingCompany?.id ?? `demo-company-${Date.now()}`,
      created_at: existingCompany?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const query = existingCompany
    ? supabase
        .from("company_profiles")
        .update(payload)
        .eq("id", existingCompany.id)
    : supabase.from("company_profiles").insert(payload);
  const { data, error } = await query.select(COMPANY_COLUMNS).single();

  if (error) {
    throwCompanyDatabaseError(error);
  }

  return toCompanyViewModel(data);
}

export async function deleteCompany(companyId) {
  if (demoMode) {
    return removeStoredCompany(companyId);
  }

  const { error } = await supabase
    .from("company_profiles")
    .delete()
    .eq("id", companyId);

  if (error) {
    throwCompanyDatabaseError(error);
  }
}

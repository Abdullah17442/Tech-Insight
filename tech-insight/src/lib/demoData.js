import blogs from "../data/blogs.js";
import companies from "../data/companies.js";

const ARTICLE_STORAGE_KEY = "tech-insight-demo-articles";
const EVENT_STORAGE_KEY = "tech-insight-demo-events";
const SESSION_STORAGE_KEY = "tech-insight-demo-session";
const COMPANY_STORAGE_KEY = "tech-insight-demo-companies";

export const DEFAULT_ADMIN_EMAIL = "admin@techinsight.local";
export const DEFAULT_ADMIN_PASSWORD = "techinside123";

function safeStorageGet(key) {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("Unable to read local storage:", error);
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Unable to write local storage:", error);
  }
}

function safeStorageRemove(key) {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Unable to clear local storage:", error);
  }
}

export function getDefaultArticles() {
  return blogs.map((blog, index) => ({
    ...blog,
    id: blog.id ?? index + 1,
    status: blog.status ?? "published",
    created_at: blog.created_at ?? new Date().toISOString(),
    updated_at: blog.updated_at ?? new Date().toISOString(),
    published_at: blog.published_at ?? new Date().toISOString(),
    category: blog.category ?? "Technology",
    subtitle: blog.subtitle ?? blog.description ?? "",
    company_name: blog.company ?? "",
  }));
}

export function getStoredArticles() {
  const raw = safeStorageGet(ARTICLE_STORAGE_KEY);

  if (!raw) {
    const seeded = getDefaultArticles();
    safeStorageSet(ARTICLE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Could not parse article storage. Resetting demo data.", error);
    const seeded = getDefaultArticles();
    safeStorageSet(ARTICLE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveStoredArticles(articles) {
  safeStorageSet(ARTICLE_STORAGE_KEY, JSON.stringify(articles));
  return articles;
}

export function upsertStoredArticle(article) {
  const articles = getStoredArticles();
  const index = articles.findIndex((entry) => entry.id === article.id);

  if (index >= 0) {
    articles[index] = { ...articles[index], ...article };
  } else {
    articles.unshift({ ...article, id: article.id ?? Date.now() });
  }

  return saveStoredArticles(articles);
}

export function removeStoredArticle(articleId) {
  const articles = getStoredArticles();
  const remainingArticles = articles.filter(
    (article) => article.id !== articleId
  );
  saveStoredArticles(remainingArticles);
  return remainingArticles.length !== articles.length;
}

export function getStoredCompanies() {
  const raw = safeStorageGet(COMPANY_STORAGE_KEY);

  if (!raw) {
    const seeded = companies.map((company) => ({
      ...company,
      logo_url: company.logo || "",
      description: company.description || `${company.name} technology company.`,
    }));
    safeStorageSet(COMPANY_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const storedCompanies = JSON.parse(raw);
    return Array.isArray(storedCompanies) ? storedCompanies : [];
  } catch (error) {
    console.warn("Could not parse company storage.", error);
    return [];
  }
}

export function saveStoredCompanies(items) {
  safeStorageSet(COMPANY_STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function upsertStoredCompany(company) {
  const items = getStoredCompanies();
  const index = items.findIndex((entry) => entry.id === company.id);

  if (index >= 0) {
    items[index] = { ...items[index], ...company };
  } else {
    items.unshift(company);
  }

  saveStoredCompanies(items);
  return company;
}

export function removeStoredCompany(companyId) {
  const items = getStoredCompanies();
  const remaining = items.filter((company) => company.id !== companyId);
  saveStoredCompanies(remaining);
  return remaining.length !== items.length;
}

export function getStoredEvents() {
  const raw = safeStorageGet(EVENT_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.warn("Could not parse event storage.", error);
    return [];
  }
}

export function upsertStoredEvent(event) {
  const events = getStoredEvents();
  const index = events.findIndex((entry) => entry.id === event.id);

  if (index >= 0) {
    events[index] = { ...events[index], ...event };
  } else {
    events.unshift(event);
  }

  safeStorageSet(EVENT_STORAGE_KEY, JSON.stringify(events));
  return event;
}

export function getDemoSession() {
  const raw = safeStorageGet(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Could not parse demo session.", error);
    return null;
  }
}

export function setDemoSession(session) {
  safeStorageSet(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearDemoSession() {
  safeStorageRemove(SESSION_STORAGE_KEY);
}

export function validateDemoCredentials(email, password) {
  return (
    String(email || "").trim().toLowerCase() === DEFAULT_ADMIN_EMAIL &&
    String(password || "") === DEFAULT_ADMIN_PASSWORD
  );
}

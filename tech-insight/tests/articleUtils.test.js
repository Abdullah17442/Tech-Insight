import test from "node:test";
import assert from "node:assert/strict";
import {
  ARTICLE_FONT_FAMILIES,
  articleContentToHtml,
  buildArticlePayload,
  createUniqueSlug,
  getSafeArticleFontFamily,
  sortArticlesByPublicationDate,
  toArticleViewModel,
  describeImageUploadError,
  validateArticleInput,
  validateImageFile,
} from "../src/lib/articleUtils.js";
import {
  getStoredArticles,
  removeStoredArticle,
} from "../src/lib/demoData.js";

test("allows only the five supported article fonts", () => {
  assert.deepEqual(ARTICLE_FONT_FAMILIES, [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Trebuchet MS",
  ]);
  assert.equal(getSafeArticleFontFamily("Georgia"), "Georgia");
  assert.equal(getSafeArticleFontFamily('"Times New Roman"'), "Times New Roman");
  assert.equal(getSafeArticleFontFamily("'Verdana'"), "Verdana");
  assert.equal(getSafeArticleFontFamily("Georgia; color: red"), "");
  assert.equal(getSafeArticleFontFamily("Georgia, serif"), "");
  assert.equal(getSafeArticleFontFamily(""), "");
});

test("removes an article from demo storage", () => {
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
    const articles = getStoredArticles();
    const firstArticleId = articles[0].id;

    assert.equal(removeStoredArticle(firstArticleId), true);
    assert.equal(
      getStoredArticles().some((article) => article.id === firstArticleId),
      false
    );
    assert.equal(removeStoredArticle(firstArticleId), false);
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("creates a unique, URL-safe slug", () => {
  assert.equal(
    createUniqueSlug("AI Data Centers", ["ai-data-centers", "other"]),
    "ai-data-centers-2"
  );
});

test("sorts newly published articles ahead of older published articles", () => {
  const recent = { slug: "recent", published_at: "2026-11-01T10:00:00.000Z" };
  const older = { slug: "older", published_at: "2026-10-31T10:00:00.000Z" };

  assert.deepEqual(sortArticlesByPublicationDate([older, recent]), [recent, older]);
});

test("requires a title and article content", () => {
  assert.deepEqual(validateArticleInput({ title: " ", content: "" }), {
    valid: false,
    message: "Title and article content are required.",
  });
});

test("rejects article content that contains only empty formatting", () => {
  assert.equal(
    validateArticleInput({ title: "An article", content: "<p><br></p>" }).valid,
    false
  );
});

test("converts plain article paragraphs to editable HTML", () => {
  assert.equal(
    articleContentToHtml("First paragraph.\n\nSecond paragraph."),
    "<p>First paragraph.</p><p>Second paragraph.</p>"
  );
});

test("maps the editor fields to the Supabase blogs schema", () => {
  const payload = buildArticlePayload(
    {
      title: "Cloud infrastructure",
      subtitle: "A closer look",
      category: "Cloud",
      company_name: "Example Co.",
      content: "Article body",
      status: "draft",
      image_url: "https://example.com/cover.webp",
    },
    { existingArticle: null, existingSlugs: [] }
  );

  assert.equal(payload.slug, "cloud-infrastructure");
  assert.equal(payload.company, "Example Co.");
  assert.equal(payload.image_url, "https://example.com/cover.webp");
  assert.equal(payload.status, "draft");
  assert.equal(payload.content, "Article body");
  assert.equal("company_name" in payload, false);
});

test("rejects unsupported or oversized image uploads", () => {
  assert.deepEqual(
    validateImageFile({ type: "image/svg+xml", size: 100 }),
    {
      valid: false,
      message: "Use a JPG, PNG, or WebP image.",
    }
  );
  assert.deepEqual(
    validateImageFile({ type: "image/png", size: 6 * 1024 * 1024 }),
    {
      valid: false,
      message: "Image must be 5 MB or smaller.",
    }
  );
});

test("explains how to fix a missing Supabase storage bucket", () => {
  const message = describeImageUploadError(
    { message: "Bucket not found", statusCode: "404" },
    "https://project-ref.supabase.co"
  );

  assert.match(message, /article-images/);
  assert.match(message, /project-ref\.supabase\.co/);
  assert.match(message, /article_images_bucket\.sql/i);
});

test("does not recommend recreating a bucket that the Storage API can reach", () => {
  const message = describeImageUploadError(
    { message: "Bucket not found", statusCode: "404" },
    "https://project-ref.supabase.co",
    true
  );

  assert.match(message, /bucket is reachable/i);
  assert.match(message, /Network panel/i);
  assert.doesNotMatch(message, /Create it by applying/i);
});

test("adapts saved article text to the existing public article layout", () => {
  const article = toArticleViewModel({
    id: "article-id",
    title: "New article",
    subtitle: "A useful summary",
    content: "First paragraph.\n\nSecond paragraph.",
    image_url: "https://example.com/cover.webp",
    company_name: "Example Co.",
    created_at: "2026-10-16T00:00:00.000Z",
  });

  assert.equal(article.description, "A useful summary");
  assert.equal(article.image, "https://example.com/cover.webp");
  assert.equal(article.company, "Example Co.");
  assert.deepEqual(article.content[0].paragraphs, [
    "First paragraph.",
    "Second paragraph.",
  ]);
});

test("preserves formatted article HTML for rendering", () => {
  const article = toArticleViewModel({
    id: "article-id",
    title: "Formatted article",
    content: "<p>A <strong>bold</strong> point.</p>",
  });

  assert.deepEqual(article.content[0].paragraphs, [
    "<p>A <strong>bold</strong> point.</p>",
  ]);
  assert.equal(article.description, "A bold point.");
});

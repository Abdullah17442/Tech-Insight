import { isSafeArticleImageSource } from "./articleEditorUtils.js";

export const MAX_ARTICLE_IMAGE_SIZE = 5 * 1024 * 1024;
export const ARTICLE_FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_ARTICLE_FONTS = new Set(ARTICLE_FONT_FAMILIES);

export function getSafeArticleFontFamily(value) {
  const fontFamily = String(value || "")
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");
  return ALLOWED_ARTICLE_FONTS.has(fontFamily) ? fontFamily : "";
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueSlug(title, existingSlugs = [], currentSlug = "") {
  const baseSlug = slugify(title) || "untitled-article";
  const existing = new Set(
    existingSlugs.filter((slug) => slug && slug !== currentSlug)
  );
  let slug = baseSlug;
  let suffix = 2;

  while (existing.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function sortArticlesByPublicationDate(articles) {
  return [...articles].sort((first, second) => {
    const firstDate = Date.parse(first.published_at || first.created_at || "");
    const secondDate = Date.parse(second.published_at || second.created_at || "");
    const normalizedFirstDate = Number.isNaN(firstDate) ? 0 : firstDate;
    const normalizedSecondDate = Number.isNaN(secondDate) ? 0 : secondDate;
    return normalizedSecondDate - normalizedFirstDate;
  });
}

export function toLocalDateTimeInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function validateArticleInput(article) {
  const plainContent = String(article?.content || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();

  if (!article?.title?.trim() || !plainContent) {
    return {
      valid: false,
      message: "Title and article content are required.",
    };
  }

  if (!["draft", "published", "scheduled"].includes(article.status)) {
    return { valid: false, message: "Choose a valid article status." };
  }

  if (article.status === "scheduled") {
    const publicationDate = new Date(article.published_at);
    if (
      !article.published_at ||
      Number.isNaN(publicationDate.getTime()) ||
      publicationDate <= new Date()
    ) {
      return {
        valid: false,
        message: "Choose a valid publication date and time in the future.",
      };
    }
  }

  return { valid: true, message: "" };
}

export function sanitizeArticleHtml(value) {
  const html = String(value || "");

  if (typeof DOMParser === "undefined") {
    return html
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const sanitized = parsed.createElement("div");
  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "DIV",
    "EM",
    "H2",
    "H3",
    "IMG",
    "I",
    "LI",
    "OL",
    "P",
    "STRONG",
    "U",
    "UL",
  ]);
  const blockedTags = new Set([
    "IFRAME",
    "OBJECT",
    "SCRIPT",
    "STYLE",
    "SVG",
    "TEMPLATE",
  ]);

  function copySafeNodes(source, target) {
    for (const node of source.childNodes) {
      if (node.nodeType === 3) {
        target.append(parsed.createTextNode(node.textContent || ""));
        continue;
      }

      if (node.nodeType !== 1 || blockedTags.has(node.tagName)) {
        continue;
      }

      if (node.tagName === "FONT" || node.tagName === "SPAN") {
        const fontFamily = getSafeArticleFontFamily(
          node.tagName === "FONT"
            ? node.getAttribute("face")
            : node.getAttribute("data-font") || node.style.fontFamily
        );
        if (fontFamily) {
          const safeNode = parsed.createElement("span");
          safeNode.setAttribute("data-font", fontFamily);
          copySafeNodes(node, safeNode);
          target.append(safeNode);
        } else {
          copySafeNodes(node, target);
        }
        continue;
      }

      if (!allowedTags.has(node.tagName)) {
        copySafeNodes(node, target);
        continue;
      }

      const safeNode = parsed.createElement(node.tagName.toLowerCase());
      if (node.tagName === "A") {
        const href = Array.from(node.getAttribute("href") || "")
          .filter((character) => {
            const code = character.charCodeAt(0);
            return code > 32 && code !== 127;
          })
          .join("");
        if (/^(https?:|mailto:|\/|#|\?|\.\.?\/)/i.test(href)) {
          safeNode.setAttribute("href", href);
        } else if (!/^[a-z][a-z\d+.-]*:/i.test(href) && href) {
          safeNode.setAttribute("href", href);
        }
      } else if (node.tagName === "IMG") {
        const source = node.getAttribute("src");
        if (!isSafeArticleImageSource(source)) {
          continue;
        }
        safeNode.setAttribute("src", source.trim());
        const alt = node.getAttribute("alt");
        if (alt) {
          safeNode.setAttribute("alt", alt);
        }
        const width = Number(node.getAttribute("width"));
        if (Number.isInteger(width) && width >= 1 && width <= 4096) {
          safeNode.setAttribute("width", String(width));
        }
      }
      copySafeNodes(node, safeNode);
      target.append(safeNode);
    }
  }

  copySafeNodes(parsed.body, sanitized);
  return sanitized.innerHTML;
}

export function articleContentToHtml(value) {
  const content = String(value || "");
  if (/<\/?[a-z][^>]*>/i.test(content)) {
    return sanitizeArticleHtml(content);
  }

  return content
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) =>
      `<p>${paragraph
        .split(/\r?\n/)
        .map((line) => sanitizeArticleHtml(line))
        .join("<br>")}</p>`
    )
    .join("");
}

export function validateImageFile(file) {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      message: "Use a JPG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_ARTICLE_IMAGE_SIZE) {
    return {
      valid: false,
      message: "Image must be 5 MB or smaller.",
    };
  }

  return { valid: true, message: "" };
}

export function describeImageUploadError(
  error,
  projectUrl = "",
  bucketIsReachable = false
) {
  const message = error?.message || "Image upload failed.";

  if (/bucket not found/i.test(message)) {
    const project = projectUrl.match(/^https?:\/\/([^/]+)/i)?.[1] || "";

    if (bucketIsReachable) {
      return [
        `The "article-images" bucket is reachable${project ? ` in ${project}` : ""},`,
        `but the upload endpoint returned "${message}".`,
        "Check the browser Network panel to confirm the upload request uses the same Supabase project URL and Storage API as the bucket check.",
      ].join(" ");
    }

    return [
      `Supabase Storage bucket "article-images" was not found${project ? ` in ${project}` : ""}.`,
      "Create it by applying supabase/migrations/20261017202000_article_images_bucket.sql,",
      "or confirm .env.local points to the Supabase project where that bucket exists, then restart Vite.",
    ].join(" ");
  }

  return message;
}

export function buildArticlePayload(
  article,
  { existingArticle = null, existingSlugs = [] } = {}
) {
  const title = article.title.trim();
  const slug = createUniqueSlug(
    title,
    existingSlugs,
    existingArticle?.slug ?? ""
  );
  const now = new Date().toISOString();
  const status = ["published", "scheduled"].includes(article.status)
    ? article.status
    : "draft";
  const publicationDate = new Date(article.published_at);

  return {
    title,
    subtitle: article.subtitle?.trim() || null,
    slug: existingArticle?.slug || slug,
    content: article.content.trim(),
    image_url: article.image_url || null,
    category: article.category?.trim() || "Technology",
    company: article.company_name?.trim() || article.company?.trim() || null,
    status,
    created_at: existingArticle?.created_at || now,
    updated_at: now,
    published_at:
      status === "scheduled"
        ? publicationDate.toISOString()
        : status === "published"
          ? existingArticle?.status === "published" &&
            existingArticle.published_at
            ? existingArticle.published_at
            : now
          : null,
  };
}

export function toArticleViewModel(article) {
  const textContent =
    typeof article.content === "string"
      ? article.content
      : "";
  const plainTextContent = textContent.replace(/<[^>]*>/g, " ").trim();
  let content = article.content;

  if (textContent) {
    content = [
      {
        heading: "Article",
        paragraphs: /<\/?[a-z][^>]*>/i.test(textContent)
          ? [textContent]
          : textContent
              .split(/\r?\n\s*\r?\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean),
      },
    ];
  } else if (!Array.isArray(content)) {
    content = [];
  }

  const wordCount = plainTextContent
    ? plainTextContent.split(/\s+/).filter(Boolean).length
    : 0;
  const displayDate = article.published_at || article.created_at;
  const isDueScheduledArticle =
    article.status === "scheduled" &&
    Date.parse(article.published_at || "") <= Date.now();

  return {
    ...article,
    status: isDueScheduledArticle ? "published" : article.status,
    description:
      article.subtitle ||
      plainTextContent.replace(/\s+/g, " ").slice(0, 180),
    image: article.image_url || article.image || "",
    company: article.company || article.company_name || "",
    content,
    type: article.type || "Article",
    date: displayDate
      ? new Date(displayDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "",
    readTime: article.readTime || `${Math.max(1, Math.ceil(wordCount / 200))} Min Read`,
  };
}

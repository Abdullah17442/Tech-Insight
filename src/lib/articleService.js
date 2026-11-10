import {
  getDefaultArticles,
  removeStoredArticle,
  getStoredArticles,
  upsertStoredArticle,
} from "./demoData";
import {
  buildArticlePayload,
  describeImageUploadError,
  sortArticlesByPublicationDate,
  toArticleViewModel,
  validateArticleInput,
  validateImageFile,
} from "./articleUtils";
import { demoMode, supabase, supabaseProjectUrl } from "./supabaseClient";

const ARTICLE_COLUMNS =
  "id, title, subtitle, slug, content, image_url, category, company, status, created_at, updated_at, published_at";

function throwDatabaseError(error) {
  if (
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    /column .* does not exist/i.test(error?.message || "")
  ) {
    throw new Error(
      "The Supabase blogs schema is missing a required column. Apply the migration in supabase/migrations before saving articles."
    );
  }

  throw error;
}

export async function listAdminArticles() {
  if (demoMode) {
    return getStoredArticles().map(toArticleViewModel);
  }

  const { data, error } = await supabase
    .from("blogs")
    .select(ARTICLE_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throwDatabaseError(error);
  }

  return (data || []).map(toArticleViewModel);
}

export async function listAdminArticleViewCounts() {
  if (demoMode) {
    return [];
  }

  const { data, error } = await supabase
    .from("article_view_counts")
    .select("article_id, total_views");

  if (error) {
    if (
      error?.code === "42P01" ||
      error?.code === "PGRST205" ||
      /article_view_counts.*does not exist|could not find the table/i.test(
        error?.message || ""
      )
    ) {
      throw new Error(
        "Article view analytics are not installed. Apply supabase/migrations/20261108130000_article_view_analytics.sql."
      );
    }
    throw error;
  }

  return data || [];
}

export async function listAdminArticleDailyViewCounts(date) {
  if (demoMode) {
    return [];
  }

  const { data, error } = await supabase
    .from("article_daily_view_counts")
    .select("article_id, total_views")
    .eq("view_date", date);

  if (error) {
    if (
      error?.code === "42P01" ||
      error?.code === "PGRST205" ||
      /article_daily_view_counts.*does not exist|could not find the table/i.test(
        error?.message || ""
      )
    ) {
      throw new Error(
        "Daily article view analytics are not installed. Apply supabase/migrations/20261108140000_article_view_analytics_daily.sql."
      );
    }
    throw error;
  }

  return data || [];
}

export async function resetAdminArticleViews() {
  if (demoMode) {
    throw new Error("Article view analytics require a configured Supabase project.");
  }

  const { error } = await supabase.rpc("reset_article_views");
  if (error) {
    if (
      error?.code === "PGRST202" ||
      error?.code === "42883" ||
      /function .*reset_article_views.* does not exist/i.test(
        error?.message || ""
      )
    ) {
      throw new Error(
        "The view reset action is not installed. Apply supabase/migrations/20261108140000_article_view_analytics_daily.sql."
      );
    }
    throw error;
  }
}

export async function recordArticleView(articleId) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(articleId)
    );
  if (demoMode || !isUuid) {
    return;
  }

  const { error } = await supabase.rpc("record_article_view", {
    p_article_id: articleId,
  });

  if (error) {
    if (
      error?.code === "PGRST202" ||
      error?.code === "42883" ||
      /function .*record_article_view.* does not exist/i.test(
        error?.message || ""
      )
    ) {
      throw new Error(
        "Article view tracking is not installed. Apply supabase/migrations/20261108130000_article_view_analytics.sql."
      );
    }
    throw error;
  }
}

export async function listPublishedArticles() {
  if (demoMode) {
    const now = Date.now();
    return sortArticlesByPublicationDate(
      getStoredArticles()
        .filter(
          (article) =>
            article.status === "published" ||
            (article.status === "scheduled" &&
              Date.parse(article.published_at || "") <= now)
        )
        .map(toArticleViewModel)
    );
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("blogs")
    .select(ARTICLE_COLUMNS)
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
    .order("published_at", { ascending: false });

  if (error) {
    throwDatabaseError(error);
  }

  const articles = data || [];
  return sortArticlesByPublicationDate(
    (articles.length ? articles : getDefaultArticles()).map(toArticleViewModel)
  );
}

export async function listUpcomingArticles() {
  if (demoMode) {
    const now = Date.now();
    return getStoredArticles()
      .filter(
        (article) =>
          article.status === "scheduled" &&
          Date.parse(article.published_at || "") > now
      )
      .sort(
        (first, second) =>
          Date.parse(first.published_at) - Date.parse(second.published_at)
      )
      .map(toArticleViewModel);
  }

  const { data, error } = await supabase.rpc("list_upcoming_blogs");
  if (error) {
    if (
      error?.code === "PGRST202" ||
      error?.code === "42883" ||
      /function .*list_upcoming_blogs.* does not exist/i.test(
        error?.message || ""
      )
    ) {
      throw new Error(
        "The Supabase scheduled articles function is missing. Apply supabase/migrations/20261104120000_scheduled_articles.sql."
      );
    }
    throwDatabaseError(error);
  }

  return (data || []).map((article) => ({
    ...article,
    description: article.subtitle || "",
    image: article.image_url || "",
    company: article.company || "",
    type: "Scheduled article",
    date: article.published_at
      ? new Date(article.published_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "",
  }));
}

export async function uploadArticleImage(file) {
  const validation = validateImageFile(file);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (demoMode) {
    throw new Error(
      "Image uploads require a configured Supabase project. Add your Supabase environment variables and apply the storage migration."
    );
  }

  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[file.type];
  const filePath = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("article-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    let bucketIsReachable = false;

    if (/bucket not found/i.test(error.message || "")) {
      const { error: checkError } = await supabase.storage
        .from("article-images")
        .list("", { limit: 1 });
      bucketIsReachable = !checkError;
    }

    throw new Error(
      describeImageUploadError(error, supabaseProjectUrl, bucketIsReachable)
    );
  }

  const { data } = supabase.storage
    .from("article-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("The image uploaded, but Supabase returned no public URL.");
  }

  return { filePath, publicUrl: data.publicUrl };
}

export async function saveArticle(article, { existingArticle, imageFile } = {}) {
  const validation = validateArticleInput(article);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const currentArticles = await listAdminArticles();
  let uploadedImage = null;
  if (imageFile) {
    uploadedImage = await uploadArticleImage(imageFile);
  }

  const payload = buildArticlePayload(
    {
      ...article,
      image_url:
        uploadedImage?.publicUrl ||
        article.image_url ||
        existingArticle?.image_url ||
        null,
    },
    {
      existingArticle,
      existingSlugs: currentArticles
        .filter((entry) => entry.id !== existingArticle?.id)
        .map((entry) => entry.slug),
    }
  );

  if (demoMode) {
    const savedArticle = upsertStoredArticle({
      ...payload,
      id: existingArticle?.id ?? `demo-${Date.now()}`,
    });
    return toArticleViewModel(savedArticle);
  }

  const query = existingArticle
    ? supabase.from("blogs").update(payload).eq("id", existingArticle.id)
    : supabase.from("blogs").insert(payload);
  const { data, error } = await query.select(ARTICLE_COLUMNS).single();

  if (error) {
    if (uploadedImage) {
      const { error: cleanupError } = await supabase.storage
        .from("article-images")
        .remove([uploadedImage.filePath]);
      if (cleanupError) {
        console.error("Could not remove an unused uploaded image:", cleanupError);
      }
    }
    throwDatabaseError(error);
  }

  return toArticleViewModel(data);
}

export async function deleteArticle(articleId) {
  if (!articleId) {
    throw new Error("An article id is required to delete an article.");
  }

  if (demoMode) {
    if (!removeStoredArticle(articleId)) {
      throw new Error("The article could not be found in demo storage.");
    }
    return;
  }

  const { data, error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", articleId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (
      error?.code === "42501" ||
      /permission denied|row-level security/i.test(error?.message || "")
    ) {
      throw new Error(
        "Supabase denied article deletion. Confirm you are signed in with admin MFA, then apply supabase/migrations/20261029120000_admin_article_delete.sql."
      );
    }
    throwDatabaseError(error);
  }

  if (!data) {
    throw new Error(
      "The article was not deleted. It may no longer exist or your account may not have permission."
    );
  }
}

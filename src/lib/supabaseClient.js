
import { createClient } from "@supabase/supabase-js";
import {
  clearDemoSession,
  DEFAULT_ADMIN_EMAIL,
  getDemoSession,
  getStoredArticles,
  setDemoSession,
  validateDemoCredentials,
} from "./demoData";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL;
export const supabaseProjectUrl = supabaseUrl;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

if (isSupabaseConfigured && typeof window !== "undefined") {
  const projectReference = new URL(supabaseUrl).hostname.split(".")[0];
  try {
    window.localStorage.removeItem(`sb-${projectReference}-auth-token`);
  } catch (error) {
    console.warn("Unable to clear the old persisted Supabase session:", error);
  }
}

if (!isSupabaseConfigured && !import.meta.env.DEV) {
  throw new Error(
    "Supabase environment variables are required for a production build."
  );
}

if (!isSupabaseConfigured) {
  clearDemoSession();
}

function buildDemoDataHandlers() {
  const getTableData = (table) => {
    if (table === "blogs") {
      return getStoredArticles();
    }

    if (table === "admins") {
      return [
        {
          user_id: "demo-admin-user",
          email: DEFAULT_ADMIN_EMAIL,
        },
      ];
    }

    return [];
  };

  const applyFilter = (rows, field, value) =>
    rows.filter((row) => row[field] === value);

  const applyOrder = (rows, field, ascending = true) => {
    if (!field || !rows.length) {
      return [...rows];
    }

    return [...rows].sort((left, right) => {
      const leftValue = left[field] ?? "";
      const rightValue = right[field] ?? "";

      if (leftValue < rightValue) {
        return ascending ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return ascending ? 1 : -1;
      }

      return 0;
    });
  };

  return {
    from: (table) => ({
      select: () => ({
        order: async (field, options = {}) => {
          const { ascending = true } = options;
          return {
            data: applyOrder(getTableData(table), field, ascending),
            error: null,
          };
        },
        eq: (field, value) => ({
          maybeSingle: async () => {
            const match = applyFilter(getTableData(table), field, value)[0] ?? null;
            return { data: match, error: null };
          },
        }),
        maybeSingle: async () => {
          const rows = getTableData(table);
          return { data: rows[0] ?? null, error: null };
        },
      }),
      order: async (field, options = {}) => {
        const { ascending = true } = options;
        return {
          data: applyOrder(getTableData(table), field, ascending),
          error: null,
        };
      },
      eq: (field, value) => ({
        maybeSingle: async () => {
          const match = applyFilter(getTableData(table), field, value)[0] ?? null;
          return { data: match, error: null };
        },
      }),
    }),
    auth: {
      getSession: async () => {
        const session = getDemoSession();
        return { data: { session }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (validateDemoCredentials(normalizedEmail, password)) {
          const session = {
            user: {
              id: "demo-admin-user",
              email: normalizedEmail,
            },
          };

          setDemoSession(session);
          return { data: { session }, error: null };
        }

        return {
          data: { session: null },
          error: { message: "Invalid email or password." },
        };
      },
      signOut: async () => {
        clearDemoSession();
        return { error: null };
      },
    },
  };
}

const demoClient = buildDemoDataHandlers();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage:
          typeof window === "undefined" ? undefined : window.sessionStorage,
      },
    })
  : {
      from: demoClient.from,
      auth: demoClient.auth,
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    };

export const demoMode = !isSupabaseConfigured;

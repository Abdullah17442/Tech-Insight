import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function ProtectedRoute() {
const [status, setStatus] = useState("loading");

useEffect(() => {
let active = true;


async function verifyAdmin() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      if (active) setStatus("unauthenticated");
      return;
    }

    const { data, error } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (active) {
      setStatus(data ? "authorized" : "unauthorized");
    }
  } catch (error) {
    console.error("Admin verification failed:", error);

    if (active) {
      setStatus("error");
    }
  }
}

verifyAdmin();

return () => {
  active = false;
};


}, []);

if (status === "loading") {
return <p>Checking admin access...</p>;
}

if (status === "unauthenticated") {
return <Navigate to="/admin/login" replace />;
}

if (status === "unauthorized") {
return <Navigate to="/" replace />;
}

if (status === "error") {
return (
<div style={{ padding: "24px" }}> <h2>Unable to verify admin access</h2> <p>Please check the browser console for the underlying error.</p> </div>
);
}

return <Outlet />;
}

export default ProtectedRoute;

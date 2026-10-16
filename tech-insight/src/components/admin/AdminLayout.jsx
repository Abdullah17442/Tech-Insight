import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function AdminLayout() {
const navigate = useNavigate();

async function handleLogout() {
const { error } = await supabase.auth.signOut();

```
if (error) {
  console.error("Logout failed:", error.message);
  return;
}

navigate("/admin/login", { replace: true });
```

}

return ( <div className="admin-layout"> <header className="admin-header"> <Link to="/admin" className="admin-brand">
Tech Insight <span>Admin</span> </Link>


    <nav className="admin-nav">
      <Link to="/admin">Articles</Link>
      <button type="button" onClick={handleLogout}>
        Sign out
      </button>
    </nav>
  </header>

  <main className="admin-main">
    <Outlet />
  </main>
</div>

);
}

export default AdminLayout;

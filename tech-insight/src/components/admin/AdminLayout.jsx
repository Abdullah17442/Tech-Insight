import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import BrandLogo from "../BrandLogo";
import { supabase } from "../../lib/supabaseClient";

function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      navigate("/insight-vault576/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-brand">
          <BrandLogo to="/insight-vault576" transparent />
          <span>Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/insight-vault576" end>
            Articles
          </NavLink>
          <NavLink to="/insight-vault576/events">Upcoming blogs</NavLink>
          <NavLink to="/insight-vault576/companies">Companies</NavLink>
          <Link to="/" className="admin-view-site">
            View site
          </Link>
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

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function AdminLogin() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleLogin(event) {
event.preventDefault();


setError("");
setLoading(true);

const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) {
  setError("Invalid email or password. Please try again.");
  setLoading(false);
  return;
}

if (data.session) {
  navigate("/admin", { replace: true });
}

setLoading(false);


}

return ( <div className="admin-login-page"> <form className="admin-login-form" onSubmit={handleLogin}> <h1>Tech Insight</h1> <p>Admin Portal</p>


    {error && <div className="admin-error">{error}</div>}

    <label htmlFor="admin-email">Email address</label>
    <input
      id="admin-email"
      type="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      placeholder="Enter your admin email"
      autoComplete="username"
      required
    />

    <label htmlFor="admin-password">Password</label>
    <input
      id="admin-password"
      type="password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Enter your password"
      autoComplete="current-password"
      required
    />

    <button type="submit" disabled={loading}>
      {loading ? "Signing in..." : "Sign in"}
    </button>
  </form>
</div>


);
}

export default AdminLogin;

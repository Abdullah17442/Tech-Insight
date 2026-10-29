import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import BlogPage from "./pages/BlogPage";
import TopicPage from "./pages/TopicPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NewsPage from "./pages/NewsPage";
import NotFound from "./pages/NotFound";


import AdminDashboard from "./pages/Admin/AdminDashboard";
import EventManagement from "./pages/Admin/EventManagement";
import CompanyManagement from "./pages/Admin/CompanyManagement";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";



function App() {
return ( <BrowserRouter> <Routes>
{/* Public website */}
<Route path="/" element={<Home />} />
<Route path="/news" element={<NewsPage />} />
<Route path="/blog/:slug" element={<BlogPage />} />
<Route path="/topics/:slug" element={<TopicPage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
    {/* Admin login */}
    <Route path="/insight-vault576/login" element={<AdminLogin />} />

    {/* Protected admin pages */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/insight-vault576" element={<AdminDashboard />} />
        <Route
          path="/insight-vault576/events"
          element={<EventManagement />}
        />
        <Route
          path="/insight-vault576/companies"
          element={<CompanyManagement />}
        />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

);
}

export default App;

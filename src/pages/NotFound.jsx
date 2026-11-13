import SiteBrandBar from "../components/SiteBrandBar";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <>
      <SiteBrandBar />
      <main className="not-found-page">
        <h1>404</h1>
        <p>Page not found.</p>
      </main>
      <Footer />
    </>
  );
}

export default NotFound;
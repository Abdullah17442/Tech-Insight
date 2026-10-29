import SiteBrandBar from "../components/SiteBrandBar";

function NotFound() {
  return (
    <>
      <SiteBrandBar />
      <main className="not-found-page">
        <h1>404</h1>
        <p>Page not found.</p>
      </main>
    </>
  );
}

export default NotFound;
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
// import ArtistFinderPage from "../pages/ArtistFinderPage.jsx"; // example

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/artists" element={<ArtistFinderPage />} /> */}
    </Routes>
  );
}
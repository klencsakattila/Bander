import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import EditProfileSettings from "../pages/Profile/EditProfilePage.jsx";
import SignUpPage from "../pages/Auth/RegisterPage.jsx";
import ArtistProfilePage from "../pages/Profile/ArtistProfilePage.jsx";
import BandProfilePage from "../pages/Profile/BandProfilePage.jsx";
import ArtistFinderPage from "../pages/Finder/ArtistFinderPage.jsx";

// import ArtistFinderPage from "../pages/ArtistFinderPage.jsx"; // example

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Automatically redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Home Page */}
      <Route path="/home" element={<HomePage />} />

      {/* Register Page */}
      <Route path="/signup" element={<SignUpPage />} />
<<<<<<< HEAD
      
      {/* Edit Profile Settings Page */}
      <Route path="/profile/settings" element={<EditProfileSettings />} />

=======

      {/* Edit Profile Settings Page */}
      <Route path="/profile/settings" element={<EditProfileSettings />} />

      {/* Artist Profile Page */}
      <Route path="/artist/:id" element={<ArtistProfilePage />} />
      
      {/* Band Profile Page */}
      <Route path="/band/:id" element={<BandProfilePage />} />

      {/* Artist Finder Page */}
      <Route path="/artists" element={<ArtistFinderPage />} />

>>>>>>> 7b422ec1374e8e072e74dbcf56638f9fcdf2f658
    </Routes>
  );
}
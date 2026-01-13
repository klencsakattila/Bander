import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import EditProfileSettings from "../pages/Profile/EditProfilePage.jsx";
import SignUpPage from "../pages/Auth/RegisterPage.jsx";
import ArtistProfilePage from "../pages/Profile/ArtistProfilePage.jsx";
import BandProfilePage from "../pages/Profile/BandProfilePage.jsx";
import ArtistFinderPage from "../pages/Finder/ArtistFinderPage.jsx";
import BandFinderPage from "../pages/Finder/BandFinderPage.jsx";
import MessagesPage from "../pages/Messages/MessagePage.jsx";
import EditBandPage from "../pages/Band/EditBandPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Home Page */}
      <Route path="/home" element={<HomePage />} />

      {/* Register Page */}
      <Route path="/signup" element={<SignUpPage />} />

      {/* Edit Profile Settings Page */}
      <Route path="/profile/settings" element={<EditProfileSettings />} />

      {/* Artist Profile Page */}
      <Route path="/artist/:id" element={<ArtistProfilePage />} />
      
      {/* Band Profile Page */}
      <Route path="/band/:id" element={<BandProfilePage />} />

      {/* Edit Band Page */}
      <Route path="/band/settings" element={<EditBandPage />} />

      {/* Artist Finder Page */}
      <Route path="/artists" element={<ArtistFinderPage />} />

      {/*Band Finder Page */}
      <Route path="/bands" element={<BandFinderPage />} />

      {/* Messages Page -> should be with id */}
      <Route path="/messages" element={<MessagesPage />} />

    </Routes>
  );
}
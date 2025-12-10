import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import EditProfileSettings from "../pages/Profile/EditProfilePage.jsx";
import SignUpPage from "../pages/Auth/RegisterPage.jsx";


// import ArtistFinderPage from "../pages/ArtistFinderPage.jsx"; // example

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/artists" element={<ArtistFinderPage />} /> */}

      {/* Automatically redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Home Page */}
      <Route path="/home" element={<HomePage />} />

      {/* Register Page */}
      <Route path="/signup" element={<SignUpPage />} />


      <Route path="/profile/settings" element={<EditProfileSettings />} />


    </Routes>
  );
}
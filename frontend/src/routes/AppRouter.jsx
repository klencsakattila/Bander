import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Auth/LoginPage";
import SignUpPage from "../pages/Auth/SignUpPage";

import ArtistFinderPage from "../pages/Finder/ArtistFinderPage";
import BandFinderPage from "../pages/Finder/BandFinderPage";
import ArtistProfilePage from "../pages/Profile/ArtistProfilePage";
import BandProfilePage from "../pages/Profile/BandProfilePage";
import EditProfilePage from "../pages/Profile/EditProfilePage";
import MessagesPage from "../pages/Messages/MessagePage";
import EventFinderPage from "../pages/Finder/EventFinderPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/artists" element={<ArtistFinderPage />} />
        <Route path="/bands" element={<BandFinderPage />} />
        <Route path="/artist/:id" element={<ArtistProfilePage />} />
        <Route path="/band/:id" element={<BandProfilePage />} />
        <Route path="/profile/settings" element={<EditProfilePage />} />
        <Route path="/message/:userId" element={<MessagesPage />} />
        <Route path="/events" element={<EventFinderPage />} />

      </Route>
    </Routes>
  );
}

import { useMemo, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ArtistProfilePage.css";
import avatarFallback from "../../assets/images/default-avatar.png";
import { FaInstagram, FaFacebook, FaYoutube, FaSpotify } from "react-icons/fa";
import { getUserById } from "../../services/UserService";
import { useAuth } from "../../context/AuthContext";
import { useLoadById } from "../../hooks/useLoadById";
import { useToast } from "../../context/ToastContext";
import ReportModal from "../../components/common/ReportModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const toAbsUrl = (u) =>
  u && typeof u === "string" && u.startsWith("/uploads/") ? `${API_BASE}${u}` : u;

export default function ArtistProfilePage() {
  const { id } = useParams();
  const { token, isAuth, userId } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isReportOpen, setIsReportOpen] = useState(false);

  const loader = useCallback((uid) => getUserById(uid, token), [token]);
  const { data: row, loading, error } = useLoadById(id, loader, [token]);

  const artist = useMemo(() => {
    if (!row) return null;
    return {
      id: row.id,
      username: row.username ?? "",
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      city: row.city ?? "",
      instruments: Array.isArray(row.instruments)
        ? row.instruments
        : row.instruments ? [String(row.instruments)] : [],
      styles: Array.isArray(row.styles) ? row.styles : row.styles ? [String(row.styles)] : [],
      band: row.band ?? null,
      description: row.description ?? null,
      profileImageUrl: row.profile_image_url ?? "",
    };
  }, [row]);

  function handleSendMessage() {
    if (!artist) return;
    if (!isAuth || !userId) { navigate("/login"); return; }
    if (String(userId) === String(artist.id)) {
      showToast("You can't message yourself.", "error");
      return;
    }
    navigate(`/message/${artist.id}`);
  }

  function handleOpenReport() {
    if (!artist) return;
    if (!isAuth || !userId) { navigate("/login"); return; }
    if (String(userId) === String(artist.id)) {
      showToast("You can't report yourself.", "error");
      return;
    }
    setIsReportOpen(true);
  }

  if (loading) return <p style={{ padding: "40px" }}>Loading artist...</p>;
  if (error) return <div style={{ padding: "40px" }}><p style={{ color: "#b91c1c", fontWeight: 600 }}>{String(error)}</p></div>;
  if (!artist) return <p style={{ padding: "40px" }}>No artist data.</p>;

  const displayUsername = artist.username || "Unknown";
  const displayName = [artist.firstName, artist.lastName].filter(Boolean).join(" ");
  const instrumentsText = artist.instruments.length ? artist.instruments.join(", ") : "—";
  const stylesText = artist.styles.length ? artist.styles.join(", ") : "—";

  const localKey = `bander:user:avatar:${artist.id}`;
  let localAvatar = "";
  try { localAvatar = localStorage.getItem(localKey) || ""; } catch { localAvatar = ""; }

  const avatarSrc = toAbsUrl(artist.profileImageUrl) || localAvatar || avatarFallback;

  return (
    <div className="artist-profile-page">
      <div className="artist-profile-left">
        <div className="artist-card">
          <img src={avatarSrc} alt={displayUsername} className="artist-avatar" />
          <h3 className="artist-username">{displayUsername}</h3>
          <p className="artist-meta">{displayName || "—"}</p>
          <p className="artist-meta">City: {artist.city || "—"}</p>
          <p className="artist-meta">Instrument(s): {instrumentsText}</p>
          <p className="artist-meta">Styles: {stylesText}</p>
        </div>

        <button className="send-message-btn" onClick={handleSendMessage}>
          Send a message
        </button>

        <br />

        <button className="report-btn" onClick={handleOpenReport}>
          Report
        </button>

        <div className="artist-links">
          <h4>Referral links</h4>
          <div className="social-icons">
            <FaSpotify />
            <FaInstagram />
            <FaFacebook />
            <FaYoutube />
          </div>
        </div>
      </div>

      <div className="artist-profile-right">
        <h3>Description</h3>
        <p className="artist-description">{artist.description || "—"}</p>
      </div>

      {isReportOpen && (
        <ReportModal
          targetType="user"
          targetId={artist.id}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}

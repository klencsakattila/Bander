import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./BandProfilePage.css";
import placeholder from "../../assets/images/default-avatar.png";
import eventBadge from "../../assets/images/event-badge.png";
import { getBandById, getLatestBandPosts } from "../../services/BandService";
import { useAuth } from "../../context/AuthContext";
import { formatISODate } from "../../utils/date";
import { useLoadById } from "../../hooks/useLoadById";
import { pickMedia } from "../../utils/mediaUrl";
import ReportModal from "../../components/common/ReportModal";

const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [String(v)];
};

export default function BandProfilePage() {
  const { id } = useParams();
  const bandIdNum = Number(id);
  const { token } = useAuth();

  const { data: rawBand, loading, error } = useLoadById(id, getBandById);
  const [posts, setPosts] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // ✅ Normalize band shape in case API/hook wraps it
  // supports: band, {band}, {data: band}, [band]
  const band = useMemo(() => {
    if (!rawBand) return null;
    if (Array.isArray(rawBand)) return rawBand[0] ?? null;
    if (rawBand.band) return rawBand.band;
    if (rawBand.data) return rawBand.data;
    return rawBand;
  }, [rawBand]);

  const demoBandPosts = useMemo(() => {
    const bandName = band?.bandName ?? band?.name ?? band?.band_name ?? "Band";
    return [
      {
        id: 9001,
        band_id: bandIdNum,
        band_name: bandName,
        post_type: "announcement",
        post_message:
          "🎤 New gig coming soon! Follow us for the exact date + venue details.",
        created_at: new Date().toISOString(),
      },
      {
        id: 9002,
        band_id: bandIdNum,
        band_name: bandName,
        post_type: "search",
        post_message: "We’re looking for a new member! DM us if you want to join.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }, [bandIdNum, band]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const postData = await getLatestBandPosts(20, token);
        const list = Array.isArray(postData) ? postData : [];
        if (cancelled) return;

        const onlyThisBand = list.filter((p) => Number(p?.band_id) === bandIdNum);
        setPosts(onlyThisBand.length ? onlyThisBand : demoBandPosts);
      } catch {
        if (!cancelled) setPosts(demoBandPosts);
      }
    }

    if (Number.isFinite(bandIdNum)) loadPosts();
    return () => {
      cancelled = true;
    };
  }, [token, bandIdNum, demoBandPosts]);

  if (loading) return <p style={{ padding: "40px" }}>Loading band...</p>;
  if (error) return <p style={{ padding: "40px", color: "red" }}>Band not found</p>;
  if (!band) return <p style={{ padding: "40px" }}>No band data.</p>;

  const bandTitle = band.bandName ?? band.name ?? band.band_name ?? "Band";
  const bandCity = band.bandLocation ?? band.city ?? band.location ?? "";

  const members = Array.isArray(band.members) ? band.members : [];
  const styles = Array.isArray(band.styles) ? band.styles : [];

  const bandInstruments = Array.from(
    new Set(
      members
        .flatMap((m) => toList(m?.instruments))
        .filter(Boolean)
        .map(String)
    )
  );

  return (
    <div className="band-profile-page">
      <div
        className="band-header"
        style={{
            backgroundImage: `url(${
      pickMedia(band, [
        "banner_image_url", // ✅ your backend field
        "bannerUrl",
        "banner_url",
        "banner_img",
        "banner_image",
        "cover",
        "cover_url",
      ]) || ""
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
      >
        <h1>{bandTitle}</h1>
      </div>

      <div className="band-top">
        <div className="band-info-card">
          <img
            src={
              pickMedia(band, [
                "profile_image_url",   // ✅ your backend field
                "avatar_url",
                "avatarUrl",
                "profile_img",
                "profile_image",
                "image",
                "img",
              ]) || placeholder
            }
            alt={bandTitle}
          />


          <div className="band-info-text">
            <h3>{bandTitle}</h3>
            <p>{bandCity}</p>

            <p>Open spots: —</p>

            <p>Open spots: —</p>

            <button
              className="band-report-btn"
              onClick={() => setIsReportOpen(true)}
            >
              Report band
            </button>
          </div>
        </div>
        <div className="band-apply">
          <h4>Csatlakozás a zenekarhoz</h4>
                  
          <p>
            Ha szeretnél csatlakozni a zenekarhoz, vedd fel a kapcsolatot
            az egyik jelenlegi taggal a fenti taglistából.
          </p>
                  
          <p className="muted">
            Kattints a profiljukra és írj nekik üzenetet.
          </p>
        </div>
      </div>

      <div className="band-bottom">
        <div className="band-members">
          <h4>Current members</h4>
        
          {band.members && band.members.length > 0 ? (
            <ul>
              {band.members.map((member) => (
                <li key={member.id}>
                  {member.username} - {member.instruments.join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            <p>No members yet.</p>
          )}
        </div>

        {isReportOpen && (
          <ReportModal
            targetType="band"
            targetId={band.id}
            onClose={() => setIsReportOpen(false)}
          />
        )}
    

        <div className="band-events">
          {posts.map((p) => (
            <div key={p.id} className="event-card">
              <img src={eventBadge} alt="Event" />
              <p>
                {p.post_type} {" - "} {formatISODate(p.created_at)}
              </p>
              <p>{p.post_message}</p>
              <span>See more…</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ArtistFinderPage.css";
import placeholder from "../../assets/images/default-avatar.png";
import { getAllUsers } from "../../services/UserService";

export default function ArtistFinderPage() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    instrument: "",
    genre: "",
    band: "",
  });
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);


  useEffect(() => {
    async function loadArtists() {
      try {
        const data = await getAllUsers();
        setArtists(data);
  
        // 🔹 Extract unique cities from backend data
        const uniqueCities = [
          ...new Set(
            data
              .map((artist) => artist.city)
              .filter(Boolean) // remove null / undefined
          ),
        ];
  
        setCities(uniqueCities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  
    loadArtists();
  }, []);
  

  const filteredArtists = artists.filter((artist) => {
    return (
      artist.userName.toLowerCase().includes(search.toLowerCase()) &&
      (!filters.city || artist.city === filters.city)
    );
  });

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading artists...</p>;
  }

  return (
    <div className="artist-finder-page">

      {/* SEARCH */}
      <div className="artist-search">
        <input
          type="text"
          placeholder="Search for Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="artist-finder-layout">

        {/* FILTERS */}
        <aside className="artist-filters">
        <label>City</label>
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({ ...filters, city: e.target.value })
          }
        >
          <option value="">All</option>

          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>


          <label>Instrument(s)</label>
          <select>
            <option value="">All</option>
          </select>

          <label>Genre(s)</label>
          <select>
            <option value="">All</option>
          </select>

          <label>Band</label>
          <select>
            <option value="">All</option>
          </select>
        </aside>

        {/* RESULTS */}
        <div className="artist-grid">
          {filteredArtists.map((artist) => (
            <Link
              to={`/artist/${artist.id}`}
              key={artist.id}
              className="artist-card"
            >
              <img src={placeholder} alt={artist.userName} />

              <h4>{artist.userName}</h4>
              <p>{artist.firstName} {artist.lastName}</p>
              <p>{artist.city}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

import "./EditProfileSettings.css";
import placeholder from "../../assets/images/default-avatar.png";



export default function EditProfileSettings() {
  return (
    <div className="profile-settings-page">

      {/* Left Profile Card */}
      <div className="profile-card">
        <img
          src={placeholder}
          alt="User avatar"
          className="profile-avatar"
        />

        <h3 className="profile-username">UserName</h3>

        <p className="profile-label">Full Name</p>
        <p className="profile-text">John Doe</p>

        <p className="profile-label">Description for the artist</p>
        <p className="profile-text">Some description...</p>

        <p className="profile-label">Instrument(s)</p>
        <p className="profile-text">Guitar, Bass</p>

        <p className="profile-label">City</p>
        <p className="profile-text">Budapest</p>

        <p className="profile-label">Band (if in one)</p>
        <p className="profile-text">Cool Band</p>
      </div>


      {/* Right Edit Form */}
      <form className="profile-form">
        
        <div className="form-grid">

          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Surname</label>
            <input type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Instrument(s)</label>
            <input type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Style(s)</label>
            <input type="text" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Value" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Value"></textarea>
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" placeholder="Value" />
          </div>
        </div>

        <button className="save-btn">Save Details</button>
      </form>
    </div>
  );
}

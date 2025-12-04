import { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  function handleSubmit(e) {
    e.preventDefault();

    let newErrors = {};

    // Basic validation
    if (!e.target.email.value.trim()) {
      newErrors.email = "Email is required";
    }
    if (!e.target.password.value.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    // If no errors → proceed with login
    if (Object.keys(newErrors).length === 0) {
      console.log("Logged in!");
    }
  }

  return (
    <div className="login-wrapper">

      <form className="login-box animate" onSubmit={handleSubmit}>
        <h2>Log in with email</h2>

        {/* EMAIL */}
        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* PASSWORD */}
        <div className="input-group password-group">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={errors.password ? "error" : ""}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>

          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}
        </div>

        <button className="btn-primary" type="submit">Log in</button>

        <div className="divider">or</div>

        <Link to="/signup" className="btn-secondary">
            Get started
        </Link>
      </form>
    </div>
  );
}

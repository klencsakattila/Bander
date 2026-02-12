import { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/AuthService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    const newErrors = { email: "", password: "", general: "" };

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);

    // stop if validation failed
    if (newErrors.email || newErrors.password) return;

    try {
      setLoading(true);
      const res = await loginUser({ email, password });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        setErrors((prev) => ({
          ...prev,
          general: msg || "Invalid email or password",
        }));
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        // show backend message if it returned plain text
        throw new Error(text || "Login failed");
      }
      console.log("LOGIN STATUS:", res.status);

      const token =
        data?.token ||
        data?.access_token ||
        data?.jwt;

      if (!token || typeof token !== "string") {
        console.log("Login response (no token):", data);
        throw new Error("Login succeeded but token is missing in response");
      }
      console.log("LOGIN DATA:", data);


      login(token);
      navigate("/", { replace: true });

    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err?.message || "Server error. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <form className="login-box animate" onSubmit={handleSubmit}>
        <h2>Log in with email</h2>

        {/* general error */}
        {errors.general && <p className="error-text">{errors.general}</p>}

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
            onClick={() => setShowPassword((v) => !v)}
            role="button"
            tabIndex={0}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>

          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="divider">or</div>

        <Link to="/signup" className="btn-secondary">
          Get started
        </Link>
      </form>
    </div>
  );
}

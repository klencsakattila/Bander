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
    if (newErrors.email || newErrors.password) return;

    try {
      setLoading(true);

      const res = await loginUser({ email, password });

      // ✅ 1) FETCH Response eset
      const isFetchResponse =
        res &&
        typeof res === "object" &&
        typeof res.ok === "boolean" &&
        typeof res.headers?.get === "function" &&
        typeof res.json === "function";

      let data = null;
      let status = 200;

      if (isFetchResponse) {
        status = res.status;

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          setErrors((prev) => ({
            ...prev,
            general: msg || "Invalid email or password",
          }));
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Login failed");
        }
      } else {
        // ✅ 2) AXIOS / sima objektum eset
        // Axios: { data, status, ... }
        if (res?.data !== undefined) {
          data = res.data;
          status = res.status ?? 200;
        } else {
          // plain object
          data = res;
          status = res?.status ?? 200;
        }

        // ha a backend hibát dobott és te azt ide felkapod "success" helyett,
        // akkor itt is tudsz alap validációt csinálni:
        if (data?.error || data?.message === "Invalid credentials") {
          setErrors((prev) => ({
            ...prev,
            general: data?.message || data?.error || "Invalid email or password",
          }));
          return;
        }
      }

      console.log("LOGIN STATUS:", status);
      console.log("LOGIN DATA:", data);

      const token = data?.token || data?.access_token || data?.jwt;

      if (!token || typeof token !== "string") {
        throw new Error("Login succeeded but token is missing in response");
      }

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

        {errors.general && <p className="error-text">{errors.general}</p>}

        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

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

import { useState } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/AuthService";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    const newErrors = { email: "", password: "" };
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    setFieldErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    try {
      setLoading(true);

      const res = await loginUser({ email, password });

      const isFetchResponse =
        res &&
        typeof res === "object" &&
        typeof res.ok === "boolean" &&
        typeof res.headers?.get === "function" &&
        typeof res.json === "function";

      let data = null;

      if (isFetchResponse) {
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          showToast(msg || "Invalid email or password", "error");
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
        if (res?.data !== undefined) {
          data = res.data;
        } else {
          data = res;
        }
        if (data?.error || data?.message === "Invalid credentials") {
          showToast(data?.message || data?.error || "Invalid email or password", "error");
          return;
        }
      }

      const token = data?.token || data?.access_token || data?.jwt;
      if (!token || typeof token !== "string") {
        throw new Error("Login succeeded but token is missing in response");
      }

      login(token);
      navigate("/", { replace: true });
    } catch (err) {
      showToast(err?.message || "Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <form className="login-box animate" onSubmit={handleSubmit}>
        <h2>Log in with email</h2>

        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={fieldErrors.email ? "error" : ""}
          />
          {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
        </div>

        <div className="input-group password-group">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={fieldErrors.password ? "error" : ""}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            role="button"
            tabIndex={0}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
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

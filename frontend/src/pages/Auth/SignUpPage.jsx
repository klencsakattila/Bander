import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SignUpPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/AuthService";
import { useToast } from "../../context/ToastContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState({ email: "", password1: "", password2: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const pass1 = e.target.password1.value.trim();
    const pass2 = e.target.password2.value.trim();

    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!pass1) newErrors.password1 = "Password is required";
    if (!pass2) newErrors.password2 = "Please retype the password";
    if (pass1 && pass2 && pass1 !== pass2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;

    try {
      setSubmitting(true);
      const data = await registerUser({ email, password: pass1 });
      if (!data?.token) throw new Error("No token returned from server.");
      login(data.token);
      navigate("/profile/settings", { replace: true });
    } catch (err) {
      const msg = String(err?.message || "Sign up failed");
      if (msg.toLowerCase().includes("already exists") || msg.includes("409")) {
        showToast("This email is already registered.", "error");
      } else if (msg.toLowerCase().includes("incorrect data")) {
        showToast("Please provide a valid email and password.", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signup-wrapper">
      <form className="signup-box animate" onSubmit={handleSubmit}>
        <h2>Sign up</h2>

        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={errors.email ? "error" : ""}
            disabled={submitting}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="input-group password-group">
          <input
            name="password1"
            type={showPassword1 ? "text" : "password"}
            placeholder="Password"
            className={errors.password1 ? "error" : ""}
            disabled={submitting}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword1(!showPassword1)}
            role="button"
            tabIndex={0}
          >
            {showPassword1 ? <FaEyeSlash /> : <FaEye />}
          </span>
          {errors.password1 && <p className="error-text">{errors.password1}</p>}
        </div>

        <div className="input-group password-group">
          <input
            name="password2"
            type={showPassword2 ? "text" : "password"}
            placeholder="Retype password"
            className={errors.password2 ? "error" : ""}
            disabled={submitting}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword2(!showPassword2)}
            role="button"
            tabIndex={0}
          >
            {showPassword2 ? <FaEyeSlash /> : <FaEye />}
          </span>
          {errors.password2 && <p className="error-text">{errors.password2}</p>}
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}

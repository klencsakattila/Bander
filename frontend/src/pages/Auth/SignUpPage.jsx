import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SignUpPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // ha máshol van nálad, igazítsd
import { signUp } from "../../services/AuthService"; // <- az előbb létrehozott

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password1: "",
    password2: "",
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");

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

      // ✅ backend call
      const data = await signUp(email, pass1); // expects { token }
      if (!data?.token) {
        throw new Error("No token returned from server.");
      }

      // ✅ store token in auth context
      login(data.token);

      navigate("/profile/settings", { replace: true });
    } catch (err) {
      
      const msg = String(err?.message || "Sign up failed");

      // Optional nicer messages:
      if (msg.toLowerCase().includes("already exists") || msg.includes("409")) {
        setFormError("This email is already registered.");
      } else if (msg.toLowerCase().includes("incorrect data")) {
        setFormError("Please provide a valid email and password.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signup-wrapper">
      <form className="signup-box animate" onSubmit={handleSubmit}>
        <h2>Sign up</h2>

        {formError && <p className="error-text">{formError}</p>}

        {/* EMAIL */}
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

        {/* PASSWORD */}
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

        {/* REPEAT PASSWORD */}
        <div className="input-group password-group">
          <input
            name="password2"
            type={showPassword2 ? "text" : "password"}
            placeholder="Password"
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

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SignUpPage.css";

export default function SignUpPage() {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password1: "",
    password2: "",
  });

  function handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const pass1 = e.target.password1.value.trim();
    const pass2 = e.target.password2.value.trim();

    let newErrors = {};

    if (!email) newErrors.email = "Email is required";
    if (!pass1) newErrors.password1 = "Password is required";
    if (!pass2) newErrors.password2 = "Please retype the password";

    if (pass1 && pass2 && pass1 !== pass2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("User registered successfully!");
    }
  }

  return (
    <div className="signup-wrapper">
      <form className="signup-box animate" onSubmit={handleSubmit}>

        <h2>Sign up</h2>

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
            name="password1"
            type={showPassword1 ? "text" : "password"}
            placeholder="Password"
            className={errors.password1 ? "error" : ""}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword1(!showPassword1)}
          >
            {showPassword1 ? <FaEyeSlash /> : <FaEye />}
          </span>

          {errors.password1 && (
            <p className="error-text">{errors.password1}</p>
          )}
        </div>

        {/* REPEAT PASSWORD */}
        <div className="input-group password-group">
          <input
            name="password2"
            type={showPassword2 ? "text" : "password"}
            placeholder="Password"
            className={errors.password2 ? "error" : ""}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword2(!showPassword2)}
          >
            {showPassword2 ? <FaEyeSlash /> : <FaEye />}
          </span>

          {errors.password2 && (
            <p className="error-text">{errors.password2}</p>
          )}
        </div>

        <button className="btn-primary" type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
}

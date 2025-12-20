import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { backend_url } from "../utils/config";
import "./Auth.css";
import HyperspeedBackground from "./HyperspeedBackground";

function Login({ onSwitchToSignup, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${backend_url}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container ">
      <HyperspeedBackground />
      <div className="auth-left">
        <div className="auth-card ">
          <h2>Welcome to the DL Model Builder</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="6+ strong character"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember for 30 days
              </label>
              <a href="#" className="forgot-password">
                Forgot password
              </a>
            </div>

            {error && <div className="error-message"> {error}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account?{" "}
            <span onClick={onSwitchToSignup} className="switch-link">
              Sign Up
            </span>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="hero-content">
          <h1>Designed for individuals</h1>
          <p>
            See the analytics and grow your date for Task remotely, from
            anywhere!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

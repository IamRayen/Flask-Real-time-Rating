import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import "./Login.css";
import { useAuthContext } from "../context/AuthContext";
import Header from "./sub-component/Header";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { User } = useAuthContext();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/account-overview");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to register page
    navigate("/register");
  };

  return (
    <div className="login-page">
      <Header icon="ERP"/>

      <form className="personalinfor" onSubmit={(e) => {
  e.preventDefault();
  handleLogin();
}}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          className="u-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <button className="login" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <button className="login-register-btn" onClick={handleRegister}>
        <span>No account?</span>
        <span>Register NOW!</span>
      </button>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navigate to account overview
    navigate("/account-overview");
  };

  const handleRegister = () => {
    // Navigate to register page
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="title">
        <div className="ip">
          <div className="icon">ERP</div>
        </div>
        <div className="wn">
          <h1>EventRatePro</h1>
        </div>
      </div>

      <div className="personalinfor">
        <p>Email Address</p>
        <input
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p>Password</p>
        <input
          className="u-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="login" onClick={handleLogin}>
        Log in
      </button>
      <button className="register" onClick={handleRegister}>
        No account?
        <br />
        Register NOW!
      </button>
    </div>
  );
}

export default Login;

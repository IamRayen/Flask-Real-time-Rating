import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    // Navigate to login page after registration
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="title">
        <div className="ip">
          <div className="icon">ERP</div>
        </div>
        <div className="wn">
          <h1>EventRatePro</h1>
        </div>
      </div>

      <div className="reginfor">
        <p>Email Address</p>
        <input
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p>Username</p>
        <input
          className="n-text"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p>Password</p>
        <input
          className="p-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p>Confirm your password</p>
        <input
          className="c-text"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button className="register" onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}

export default Register;

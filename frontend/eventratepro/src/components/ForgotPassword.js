import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import Header from "./sub-component/Header";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleGetSecurityCode = () => {};

  const handleResetPassword = () => {};
//📋🔍
  return (
    <div className="forgot-password-page">
      <Header icon="🔍" />

      <div className="forgot-password-form">
        <p>Registered Email</p>
        <input
          className="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="get-security-code" onClick={handleGetSecurityCode}>
          Get security code
        </button>

        <p>Enter the security code</p>
        <input
          className="security-code-input"
          type="text"
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value)}
        />

        <p>New password</p>
        <input
          className="new-password-input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <p>Confirm new password</p>
        <input
          className="confirm-password-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="reset-password" onClick={handleResetPassword}>
          Reset password
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;

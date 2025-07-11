import React from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./QRCode.css";
import { useAuthContext } from "../context/AuthContext";
import erpLogo from "../assets/erp.png";

function QRCode() {
  const { User, logout } = useAuthContext();
  const id = "questionnaire-id";
  const url = "http://localhost:3000/questionnaire/${id}";
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/create-questionnaire");
  };

  return (
    <div className="qrcode-page">
      <div className="user-header">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="header-logo-container">
          <img src={erpLogo} alt="ERP Logo" className="header-logo" />
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="qr-content">
        <QRCodeCanvas value={url} size={256} />
        <h2>Scan to Open Questionnaire</h2>
        <p>{url}</p>
      </div>
    </div>
  );
}

export default QRCode;

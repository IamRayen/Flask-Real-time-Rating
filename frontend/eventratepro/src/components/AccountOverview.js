import React from "react";
import { useNavigate } from "react-router-dom";
import "./AccountOverview.css";
import Header from "./sub-component/Header";
import { useAuthContext } from "../context/AuthContext";

function AccountOverview() {
  const navigate = useNavigate();
  const { User, logout } = useAuthContext();

  const handleAddReferees = () => {
    console.log("Add new Referees clicked");
    // Add functionality later
  };

  const handleViewQuestionnaire = () => {
    navigate("/questionnaire");
  };

  const handleViewHistory = () => {
    console.log("View History clicked");
    // Add functionality later
  };

  const handleViewDashboard = () => {
    console.log("View Dashboard clicked");
    // Add functionality later
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="account-overview-page">
      <Header icon="ERP"/>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px'}}>
        <h2>Welcome, {User?.displayName || User?.email}</h2>
        <button onClick={handleLogout} style={{padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
          Logout
        </button>
      </div>

      <div className="accinfor">
        <div className="pp">
          <div className="profile-icon">👤</div>
        </div>
        <div className="pt">
          <p onClick={handleAddReferees}>add new Referees</p>
        </div>

        <div className="qp">
          <div className="questionnaire-icon">📋</div>
        </div>
        <div className="qt">
          <p onClick={handleViewQuestionnaire}>view my Questionnaire</p>
        </div>

        <div className="hp">
          <div className="history-icon">📊</div>
        </div>
        <div className="ht">
          <p onClick={handleViewHistory}>view my History</p>
        </div>

        <div className="dp">
          <div className="dashboard-icon">📈</div>
        </div>
        <div className="dt">
          <p onClick={handleViewDashboard}>view my Dashboard</p>
        </div>
      </div>
    </div>
  );
}

export default AccountOverview;

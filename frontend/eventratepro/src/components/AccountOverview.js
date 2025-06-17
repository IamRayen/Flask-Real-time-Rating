import React from "react";
import { useNavigate } from "react-router-dom";
import "./AccountOverview.css";
import Header from "./sub-component/Header";

function AccountOverview() {
  const navigate = useNavigate();

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

  return (
    <div className="account-overview-page">
      <Header icon="ERP"/>

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

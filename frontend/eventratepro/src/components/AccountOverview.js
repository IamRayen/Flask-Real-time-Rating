import React from "react";
import "./AccountOverview.css";

function AccountOverview() {
  const handleAddReferees = () => {
    console.log("Add new Referees clicked");
    // Add functionality later
  };

  const handleViewQuestionnaire = () => {
    console.log("View Questionnaire clicked");
    // Add functionality later
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
      <div className="title">
        <div className="ip">
          <div className="icon">ERP</div>
        </div>
        <div className="wn">
          <h1>EventRatePro</h1>
        </div>
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

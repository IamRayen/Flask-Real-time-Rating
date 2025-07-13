import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./VoteRoleSelection.css";
import erpLogo from "../assets/erp.png";

function VoteRoleSelection() {
  const navigate = useNavigate();
  const { questionnaireID, posterID } = useParams();

  const handleChoice = (role) => {
    if (role === "referee") {
      navigate(`/login?next=/vote/${questionnaireID}/${posterID}&role=referee`);
    } else {
      navigate(`/vote/${questionnaireID}/${posterID}?role=anonym`);
    }
  };

  return (
    <div className="vote-role-selection-page">
      {/* Header with logo */}
      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      {/* Main content */}
      <div className="vote-role-content">
        <div className="vote-role-header">
          <h1>Choose Your Role</h1>
          <p>How would you like to participate in this questionnaire?</p>
        </div>

        <div className="role-options">
          <div
            className="role-card referee-card"
            onClick={() => handleChoice("referee")}
          >
            <div className="role-icon">👤</div>
            <div className="role-info">
              <h3>Referee</h3>
              <p>I am a registered referee for this event</p>
              <div className="role-features">
                <span>✓ Authenticated voting</span>
                <span>✓ Verified participation</span>
                <span>✓ Official feedback</span>
              </div>
            </div>
            <div className="role-arrow">→</div>
          </div>

          <div className="role-divider">
            <span>OR</span>
          </div>

          <div
            className="role-card anonymous-card"
            onClick={() => handleChoice("anonym")}
          >
            <div className="role-icon">🎭</div>
            <div className="role-info">
              <h3>Anonymous</h3>
              <p>I want to participate anonymously</p>
              <div className="role-features">
                <span>✓ Quick participation</span>
                <span>✓ No login required</span>
                <span>✓ Private feedback</span>
              </div>
            </div>
            <div className="role-arrow">→</div>
          </div>
        </div>

        <div className="vote-role-footer">
          <p>Your choice determines how your feedback will be recorded</p>
        </div>
      </div>
    </div>
  );
}

export default VoteRoleSelection;

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Questionnaire.css";

function Questionnaire() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const handleDeleteQuestionnaire = (questionnaireNumber) => {
    console.log(`Delete questionnaire ${questionnaireNumber}`);
  };

  const handleCreateNewQuestionnaire = () => {
    console.log("Create new questionnaire");
  };

  return (
    <div className="questionnaire-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>

      <div className="title">
        <div className="icon">📋🔍</div>
        <h1>EventRate Pro</h1>
      </div>

      <div className="questionnaires-container">
        <div className="questionnaire-card">
          <div
            className="delete-x"
            onClick={() => handleDeleteQuestionnaire(1)}
          >
            ×
          </div>
          <div className="questionnaire-icon">📋</div>
          <h3>Questionnaire 1</h3>
        </div>

        <div className="questionnaire-card">
          <div
            className="delete-x"
            onClick={() => handleDeleteQuestionnaire(2)}
          >
            ×
          </div>
          <div className="questionnaire-icon">📊</div>
          <h3>Questionnaire 2</h3>
        </div>

        <div className="questionnaire-card">
          <div
            className="delete-x"
            onClick={() => handleDeleteQuestionnaire(3)}
          >
            ×
          </div>
          <div className="questionnaire-icon">✅</div>
          <h3>Questionnaire 3</h3>
        </div>
      </div>

      <button
        className="create-new-button"
        onClick={handleCreateNewQuestionnaire}
      >
        + create new questionnaire
      </button>
    </div>
  );
}

export default Questionnaire;

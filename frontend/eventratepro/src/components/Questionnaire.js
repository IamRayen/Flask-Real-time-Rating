import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Questionnaire.css";
import Header from "./sub-component/Header";
import TemplateQuestionaire from "./sub-component/TemplateCard";
import { useAuthContext } from "../context/AuthContext";

function Questionnaire() {
  const { User } = useAuthContext();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `http://eventrate-pro.de/template/getAllTemplates?userID=${User.uid}`
        );
        const data = await res.json();
        console.log("All Templates:", data);
        setTemplates(data.templates || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    if (User?.uid) {
      fetchTemplates();
    }
  }, [User]);

  const handleViewTemplate = (templateID, templateData) => {
  navigate(`/create-questionnaire`, {
    state: { template: templateData }
  });
  };

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const handleDeleteTemplate = async (templateID) => {
    const confirmed = window.confirm("Are you sure you want to delete this template?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://eventrate-pro.de/template/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateID, userID: User.uid }),
      });
      setTemplates((prev) => prev.filter((t) => t.templateID !== templateID));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleCreateNewQuestionnaire = () => {
    navigate("/create-questionnaire");
  };

  return (
    <div className="dashboard-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>

      <Header icon="" />
      <div className="dashboard-content">
        <h2 className="dashboard-title">My Templates</h2>

        {loading ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <ul className="questionnaires-container">
            {templates.map((template, index) => (
              <li
                key={template.templateID}
                className="questionnaire-card"
                onClick={() => handleViewTemplate(template.templateID, template)}
              >
                <div
                  className="delete-x"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteTemplate(template.templateID);
                  }}
                >
                  ×
                </div>
                <div className="questionnaire-icon">📋</div>
                <h3>{template.title || "Untitled Template"}</h3>
              </li>
            ))}
          </ul>
        )}
        <button className="create-new-button" onClick={handleCreateNewQuestionnaire}>
          New Questionaire
        </button>
      </div>
    </div>
  );
}

export default Questionnaire;

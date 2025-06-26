import React from "react";
import {useEffect} from "react";
import { useNavigate} from "react-router-dom";
import "./Questionnaire.css";
import Header from "./sub-component/Header";
import TemplateQuestionaire from "./sub-component/TemplateCard";

function Questionnaire() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const handleDeleteQuestionnaire = (questionnaireNumber) => {
    //TODO: implement questionaire deletion logic
    console.log(`Delete questionnaire ${questionnaireNumber}`);
  };

  const handleCreateNewQuestionnaire = () => {
    navigate("/create-questionnaire");
  };

  const loadTemplates=()=>{
    //TODO: calls API to recieve all organizer'S templates
    console.log("Templates loaded")
  };
  useEffect(()=>{
    loadTemplates();
    return console.log("Template loaded")
  },[])

  return (
    <div className="questionnaire-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>

      <Header icon="📋" />

      <div className="questionnaires-container">

        <TemplateQuestionaire name="Questionaire 1"
        id={1}
        onDelete={handleDeleteQuestionnaire}/>

        <TemplateQuestionaire name="Questionaire 2"
          id={2}
          onDelete={handleDeleteQuestionnaire}/>

        
        <TemplateQuestionaire name="Questionaire 3"
        id={3}
         onDelete={handleDeleteQuestionnaire}/>  
       
      </div>

      <button
        className="create-new-button"
        onClick={handleCreateNewQuestionnaire}
      >
         New Questionaire
      </button>
    </div>
  );
}

export default Questionnaire;

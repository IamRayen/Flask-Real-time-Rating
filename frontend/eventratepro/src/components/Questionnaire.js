import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Questionnaire.css";
import Header from "./sub-component/Header";
import TemplateQuestionaire from "./sub-component/TemplateCard";
import { useAuthContext } from "../context/AuthContext";

function Questionnaire() {
  const { User } = useAuthContext();

  const navigate = useNavigate();
  const [Templates, setTemplates] = useState([]);

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

  const loadTemplates = () => {
    if (!User?.uid) {
      console.error("User ID not available");
      return;
    }
    //TODO: calls API to recieve all organizer'S templates
    console.log("Templates loaded");

    // built-in browser API that allows HTTP requests (GET, POST)
    // fetch = fetch data (GET) + send data (POST)
    fetch(`http://eventrate-pro.de/template/getAllTemplates?userID=${User?.uid}`)
      // wait for the response from backend and parse the response as JSON
      .then((res) => res.json())

      // process the data (all templates from Firestore)
      .then((data) => {
        console.log("All Questionnaires:", data);
        //setAllQuestionnaires(data); // your state handler
      })

      // if something goes wrong, the error is handled here
      .catch((err) => {
        console.error("Error loading templates:", err);
      });
  };

  //function that automatically loads templates when Mounting component
  useEffect(() => {
    loadTemplates();
    return console.log("Template loaded");
  }, []);

  // Conditionally renders templates
  // case1 : no templates = loads default hardcoded code
  //Case 2: renders templates using their attributs +  subcomponent "TemplateCard"
  const renderTemplates = () => {
    if (!Templates || Templates.length === 0) {
      // case1
      return (
        <>
          <TemplateQuestionaire
            name="Questionaire 1"
            id={1}
            onDelete={handleDeleteQuestionnaire}
          />

          <TemplateQuestionaire
            name="Questionaire 2"
            id={2}
            onDelete={handleDeleteQuestionnaire}
          />

          <TemplateQuestionaire
            name="Questionaire 3"
            id={3}
            onDelete={handleDeleteQuestionnaire}
          />
        </>
      );
    } else {
      //case 2
      // applies arrow function on each element in the Templates array
      //Arrow function transforms template into a TemplateQuestionaire
      // component with the needed attributes
      // returns  JSX with all templates component transformed

      return Templates.map((template, index) => (
        <TemplateQuestionaire
          name={`Questionnaire ${index + 1}`}
          id={template.questionnaireID}
          onDelete={handleDeleteQuestionnaire}
        />
      ));
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>

      <Header icon="📋" />
      <div className="questionnaires-container">{renderTemplates()}</div>
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

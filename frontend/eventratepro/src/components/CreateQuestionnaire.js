import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import "./CreateQuestionnaire.css";
import CategorySideBar from "./sub-component/CategorySideBar";
import Preview from "./sub-component/Preview";
import FormBuilder from "./sub-component/FormBuilder";

function CreateQuestionnaire() {
  const navigate = useNavigate();
  const { User } = useAuthContext();
  const [Questionnaire, setQuestionnaire] = useState(null);
  const questionnaireID = useRef(crypto.randomUUID());
  const eventID = useRef(crypto.randomUUID());
  const [criteriaList, setCriteriaList] = useState([
    {
      criteriaID: 1,
      questionnaireID: questionnaireID.current,
      title: "Structure",
      questionList: [],
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(1);
  //Tag: Function related to building the questionaire
  //allows creatinga new criteria
  const addCriteria = (name) => {
    const newCriteria = {
      criteriaID: criteriaList.length + 1,
      questionnaireID: questionnaireID.current,
      title: name,
      questionList: [],
    };
    setCriteriaList((prev) => [...prev, newCriteria]);
  };
  // This functions navigate  copies previous list inside updated
  //copies the needed criteria
  // adds the question to the questionlist of the copy
  // uses the modified criteria copy to update criterialist
  //why use copy and not change the actual object ?
  //react checks if the reference to the object has changed to
  // know if it should re-render.
  // so by making a copy to replace the original, we enforce rerendering
  // using .map helps  avoiding this process (next function)
  const addQuestionToCriteria = (question, criteriaID = selectedCategory) => {
    setCriteriaList((prev) => {
      const index = prev.findIndex((c) => c.criteriaID === criteriaID);
      if (index === -1) return prev;

      const updated = [...prev];
      updated[index] = { ...updated[index] };
      updated[index].questionList = [...updated[index].questionList, question];
      return updated;
    });
  };

  const handleBackClick = () => {
    navigate("/questionnaire");
  };

  //changes which category(criteria) is selected
  // triggers change in preview
  const handleCategoryClick = (categoryID) => {
    setSelectedCategory(categoryID);
  };

  const handleSaveQuestionnaire = () => {
    console.log("saving questionaire");
    //assigns the current Criteria list to questionaire
    // marks questionaire as template
    const questionnaireObj = {
      questionnaireID: questionnaireID.current,
      eventID: null,
      criteriaList: criteriaList,
      visualizationType: "bar",
      isTemplate: true,
    };
    setQuestionnaire(questionnaireObj);
    const daten = {
      userID: User.uid,
      Questionnaire: questionnaireObj,
    };
    console.log(daten);
    // built-in browser API that allows HTTP requests (GET, POST)
    // fetch = fetch data (GET) + send data (POST)
    fetch("http://http://127.0.0.1:5000/template/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(daten),
    })
      // wait for the response from backend and parse the response as JSON
      .then((res) => res.json())
      // once JSON is parsed, handle the response from the backend and go back to the questionnaire-overview
      .then((response) => {
        console.log("Answer from Backend:", response);
        console.log("saved questionaire");
        //navigate("/questionnaire");
      })
      // if something goes wrong, the error is handled here
      .catch((error) => {
        console.error("Error when sending:", error);
      });
  };

  const handleSetupEvent = () => {
    //TODO: API Call Task:
    // assigns an available questionaire ID to the questionaire
    //assigns an event ID to the questionaire
    // parses the questionaire object for criteria{...questionlist{...options{...}}}
    //console.log("Create QRs");
    const questionnaireObj = {
      questionnaireID: questionnaireID.current,
      eventID: eventID.current,
      criteriaList: criteriaList,
      visualizationType: "bar",
      isTemplate: false,
    };
    setQuestionnaire(questionnaireObj);
    const daten = {
      userID: User.uid,
      Questionnaire: questionnaireObj,
    };
    navigate("/event-details", { state: daten });
  };

  return (
    <div className="create-questionnaire-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>
      <div className="main-content">
        <div className="left-section">
          <h2>Preview of Questionnaire</h2>
          <div className="categories-and-preview">
            <div className="categories">
              <CategorySideBar
                list={criteriaList}
                current={selectedCategory}
                onSelect={handleCategoryClick}
                onAdd={addCriteria}
              />
            </div>
            <div className="preview-section">
              <Preview currentID={selectedCategory} list={criteriaList} />
            </div>
          </div>
        </div>
        <div className="right-section">
          <FormBuilder
            form={criteriaList}
            current={selectedCategory}
            onAdd={addQuestionToCriteria}
          />
          <div className="save-section">
            <button
              className="save-questionnaire"
              onClick={handleSaveQuestionnaire}
            >
              Save questionnaire
            </button>
            <button className="save-questionnaire" onClick={handleSetupEvent}>
              Setup event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateQuestionnaire;

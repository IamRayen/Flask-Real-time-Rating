import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import "./CreateQuestionnaire.css";
import CategorySideBar from "./sub-component/CategorySideBar";
import Preview from "./sub-component/Preview";
import FormBuilder from "./sub-component/FormBuilder";

function CreateQuestionnaire() {
    const navigate = useNavigate();
    const { User } = useAuthContext();
    const [Questionnaire,setQuestionnaire]=useState(null);
    const [criteriaList, setCriteriaList] = useState([
      {
        criteriaID: 1,
        questionnaireID: null,
        title: "Structure",
        questionList: [
          {
            questionID: 1,
            title: "Is the introduction clearly structured?",
            optionList: [
              { optionID: 1, label: "Yes", points: 5 },
              { optionID: 2, label: "Partially", points: 3 },
              { optionID: 3, label: "No", points: 0 }
            ]
          },
          {
            questionID: 2,
            title: "Is the conclusion well summarized?",
            optionList: [
              { optionID: 1, label: "Excellent", points: 5 },
              { optionID: 2, label: "Adequate", points: 3 },
              { optionID: 3, label: "Poor", points: 1 }
            ]
          },
          {
            questionID: 3,
            title: "Does the presentation follow a logical flow?",
            optionList: [
              { optionID: 1, label: "Yes", points: 5 },
              { optionID: 2, label: "Somewhat", points: 2 },
              { optionID: 3, label: "Not at all", points: 0 }
            ]
          }
        ]
      }
    ]);

    const [selectedCategory, setSelectedCategory] = useState(1);
   //Tag: Function related to building the questionaire
   //allows creatinga new criteria
    const addCriteria = (name) => {
        const newCriteria = {
          criteriaID: criteriaList.length+ 1,
          questionnaireID: null,
          title: name,
          questionList: [],
        };
        setCriteriaList(prev => [...prev, newCriteria]);
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
            setCriteriaList(prev => {
              const index = prev.findIndex(c => c.criteriaID === criteriaID);
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
     

      const handleSaveQuestionnaire = () => {
        console.log("saving questionaire" );
        //assigns the current Criteria list to questionaire
        // marks questionaire as template
        setQuestionnaire(
            {
                questionnaireID: null, //to be assigned by backend
                eventID: null,  // to be assigned by backend
                criteriaList:criteriaList,
                visualizationType: "bar",
                isTemplate: true
             });
        console.log("saved questionaire" );
          
        const daten = {
          userID: User.uid,
          questionnaireID: crypto.randomUUID(),
          eventID: crypto.randomUUID(),
          allQuestions: questions
        };

        // built-in browser API that allows HTTP requests (GET, POST)
        // fetch = fetch data (GET) + send data (POST)
        fetch('http://localhost:5000/template/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(daten),
        })

        // wait for the response from backend and parse the response as JSON
        .then(res => res.json())

        // once JSON is parsed, handle the response from the backend and go back to the questionnaire-overview
        .then(response => {
          console.log('Answer from Backend:', response);
          navigate("/questionnaire");
        })

        // if something goes wrong, the error is handled here
        .catch(error => {
          console.error('Error when sending:', error);
        });
        
      };
    
      const handleCreateQRs = () => {
        //TODO: API Call Task:
        // assigns an available questionaire ID to the questionaire
        //assigns an event ID to the questionaire
        // parses the questionaire object for criteria{...questionlist{...options{...}}}  
        console.log("Create QRs");
      };

      return(
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
                            signal={setSelectedCategory}
                            onAdd={addCriteria}/>
                        </div>
                        <div className="preview-section">
                            <Preview currentID={selectedCategory} list={criteriaList}/>
                        </div>
                    </div>
                </div>
                <div className="right-section">
                    <FormBuilder 
                    form={criteriaList}
                    current={selectedCategory}
                    onAdd={addQuestionToCriteria}/>
                    <div className="save-section">
                    <button
                        className="save-questionnaire"
                        onClick={handleSaveQuestionnaire}>
                     Save questionnaire
                    </button>
                    </div>
                </div>
            </div>

        </div>
      );
}
export default CreateQuestionnaire;
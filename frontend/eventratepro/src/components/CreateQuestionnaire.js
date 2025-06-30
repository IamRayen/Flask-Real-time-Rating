import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateQuestionnaire.css";

function CreateQuestionnaire() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("structure");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { text: "Option 1", points: 1 },
    { text: "Option 2", points: 2 },
    { text: "Option 3", points: 3 },
  ]);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "Is this poster well structured?",
      category: "structure",
      options: [
        { text: "Not at all", points: 1 },
        { text: "No", points: 2 },
        { text: "Good", points: 3 },
        { text: "Very good", points: 4 },
        { text: "Super", points: 5 },
      ],
    },
    {
      id: 2,
      text: "Is the structure easy to understand?",
      category: "structure",
      options: [
        { text: "Not at all", points: 1 },
        { text: "No", points: 2 },
        { text: "Good", points: 3 },
        { text: "Very good", points: 4 },
        { text: "Super", points: 5 },
      ],
    },
    {
      id: 3,
      text: "Is the structure creative?",
      category: "structure",
      options: [
        { text: "Not at all", points: 1 },
        { text: "No", points: 2 },
        { text: "Good", points: 3 },
        { text: "Very good", points: 4 },
        { text: "Super", points: 5 },
      ],
    },
  ]);

  const handleBackClick = () => {
    navigate("/questionnaire");
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { text: `Option ${options.length + 1}`, points: options.length + 1 },
    ]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleDeleteQuestion = () => {
    setQuestionText("");
    setOptions([
      { text: "Option 1", points: 1 },
      { text: "Option 2", points: 2 },
      { text: "Option 3", points: 3 },
    ]);
  };

  const handleAddToList = () => {
    if (questionText.trim()) {
      const newQuestion = {
        id: questions.length + 1,
        text: questionText,
        category: selectedCategory,
        options: [...options],
      };
      setQuestions([...questions, newQuestion]);
      handleDeleteQuestion();
    }
  };

// when clicked on the button: "Save questionnaire"
  const handleSaveQuestionnaire = () => {
    console.log("Save questionnaire:", questions);

     // data that is posted to the backend (all questions has their category information)
     const daten = {
      questionnaireID: crypto.randomUUID(),
      eventID: crypto.randomUUID(),
    	allQuestions: questions
    };

    // built-in browser API that allows HTTP requests (GET, POST)
    // fetch = fetch data (GET) + send data (POST)
    fetch('http://localhost:5000/questionnaire/save', {
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
    //console.log("Create QRs");
    const qrID = "qr-id";
    const qrURL = 'http://localhost:3000/qr/${qrID}';
    navigate("/qr-code");
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
              <div
                className={`category ${
                  selectedCategory === "structure" ? "active" : ""
                }`}
                onClick={() => handleCategoryClick("structure")}
              >
                structure
              </div>
              <div
                className={`category ${
                  selectedCategory === "content" ? "active" : ""
                }`}
                onClick={() => handleCategoryClick("content")}
              >
                content
              </div>
              <div
                className={`category ${
                  selectedCategory === "creativity" ? "active" : ""
                }`}
                onClick={() => handleCategoryClick("creativity")}
              >
                creativity
              </div>
            </div>

            <div className="preview-section">
              <div className="preview-header">
                <div className="logo">📋🔍</div>
                <span>EventRate Pro</span>
              </div>

              <div className="preview-category">{selectedCategory}</div>

              <div className="questions-preview">
                {questions
                  .filter((q) => q.category === selectedCategory)
                  .map((question, index) => (
                    <div key={question.id} className="question-preview">
                      <h4>
                        Q{index + 1}: {question.text}
                      </h4>
                      <div className="options-preview">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-preview">
                            <input type="radio" name={`q${question.id}`} />
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="form-section">
            <h3>Visualization type</h3>
            <div className="visualization-icons">
              <span className="chart-icon">📊</span>
              <span className="pie-icon">🥧</span>
            </div>

            <h3>Questions</h3>
            <input
              type="text"
              placeholder="add your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="question-input"
            />

            <h3>Options</h3>
            <div className="options-section">
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, "text", e.target.value)
                    }
                    className="option-input"
                  />
                  <span className="points">({option.points} points)</span>
                  <button
                    className="remove-option"
                    onClick={() => handleRemoveOption(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {options.length < 5 && (
                <button className="add-option" onClick={handleAddOption}>
                  +
                </button>
              )}
            </div>

            <div className="action-buttons">
              <button
                className="delete-question"
                onClick={handleDeleteQuestion}
              >
                Delete the question
              </button>
              <button className="add-to-list" onClick={handleAddToList}>
                Add to the list
              </button>
            </div>
          </div>

          <div className="save-section">
            <button
              className="save-questionnaire"
              onClick={handleSaveQuestionnaire}
            >
              Save questionnaire
            </button>
            <button className="create-qrs" onClick={handleCreateQRs}>
              Create QRs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuestionnaire;

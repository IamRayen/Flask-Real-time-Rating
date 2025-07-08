import { useState } from "react";





function FormBuilder({form,current,onAdd}){

    const CurrentCriteria = form.find(f => f.criteriaID === current);

    const [QuestionTitle,setQuestionTitle]=useState("");
    const [Options,setOptions]=useState([{ label:"", points: 1 },
    { label: "", points: 2 },
    { label: "", points: 3 },])

    const handleOptionChange = (index,value) => {
        const newOptions = [...Options];
        newOptions[index].label = value;
        newOptions[index].points = index <4? index+1: 5;
        setOptions(newOptions);
      };
    
    const handleAddOption = () => {
        setOptions([
          ...Options,
          { label: "", points: Options.length+1 },
        ]);
      };
    
        const handleRemoveOption = (index) => {
        if (Options.length > 1) {
          setOptions(Options.filter((_, i) => i !== index));
        }
        };

      const handleDeleteQuestion = () => {
        setQuestionTitle("");
        setOptions([
          { label: "", points: 1 },
          { label: "", points: 2 },
          { label: "", points: 3 },
        ]);
      };
    
      const handleAddToList = () => {
        // Filter out options with empty labels
            const filledOptions = Options.filter(opt => opt.label.trim() !== "");

        // Prevents question if title is empty or no filled options
            if (!QuestionTitle.trim() || filledOptions.length === 0) return;


            const question={
            questionID: CurrentCriteria.questionList.length,
            criteriaID:current ,
            title: QuestionTitle.trim(),
            optionList: filledOptions}

            onAdd(question);

          handleDeleteQuestion();// Reset inputs after adding
        };
      

    return(
        <div className="form-section">
            <h3>Visualization type</h3>
            <div className="visualization-icons">
                <span className="chart-icon">📊</span>
                <span  className="pie-icon">🥧</span>
            </div>

            <label htmlFor="Qform">Questions</label>
            <input
              id="Qform"
              type="text"
              placeholder="add your question here..."
              value={QuestionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              className="question-input"
            />

            <h3>Options</h3>
            <div className="options-section">
              {Options.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="text"
                    value={option.label}
                    placeholder= {`option ${index+1}`}
                    onChange={(e) =>
                      handleOptionChange(index,e.target.value)
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

              {Options.length < 5 && (
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
    );
}

export default FormBuilder;
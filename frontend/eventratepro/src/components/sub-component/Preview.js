function Preview(currentID,list){
    const CurrentCriteria = criteriaList.find(c => c.criteriaID === currentID);
    const questions=CurrentCriteria.questionList;

    return(
        <>
            <div className="preview-header">
                    <div className="logo">📋🔍</div>
                    <span>EventRate Pro</span>
            </div>
            <div className="preview-category">{CurrentCriteria.title}</div>
            <div className="questions-preview">
                {questions
                    .map((question, index) => (
                        <div key={question.questionID} className="question-preview">
                        <h4>
                            Q{index + 1}: {question.title}
                        </h4>
                        <div className="options-preview">
                            {question.optionList.map((option, optIndex) => (
                            <div key={optIndex} className="option-preview">
                                <input type="radio" name={`q${question.questionID}`} />
                                <span>{option.label}</span>
                            </div>
                            ))}
                        </div>
                        </div>
                    ))}
            </div>
        </>
    );
}

export default Preview;
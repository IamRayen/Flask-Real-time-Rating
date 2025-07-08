import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Voting.css";

function Voting() {
  const { questionnaireID, posterID } = useParams();
  const [answers, setAnswers] = useState({});
  const [questionnaire, setQuestionnaire] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionnaireAndEvent = async () => {
      try {
        const res = await fetch(
          `http://eventrate-pro.de/${questionnaireID}/${posterID}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setQuestionnaire(data.questionnaire);
        setEvent(data.event);
      } catch (error) {
        console.error("Error fetching questionnaire and event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaireAndEvent();
  }, [questionnaireID, posterID]);

  const handleOptionChange = (questionTitle, selectedOptionLabel) => {
    const selectedOption = questionnaire.criteriaList
      .flatMap((c) => c.questionList)
      .find((q) => q.title === questionTitle)
      ?.optionList.find((opt) => opt.label === selectedOptionLabel);

    if (selectedOption) {
      setAnswers((prev) => ({
        ...prev,
        [questionTitle]: selectedOption,
      }));
    }
  };

  const handleSubmit = async () => {
    const ticketOptionsList = Object.entries(answers).map(
      ([questionTitle, option]) => ({
        questionTitle,
        label: option.label,
        points: option.points,
      })
    );

    const data = {
      itemID: posterID,
      questionnaireID: questionnaireID,
      ticketOptionsList: ticketOptionsList,
      eventID: event?.eventID,
      role: null,
    };

    try {
      const res = await fetch("http://eventrate-pro.de/submitVote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit vote");
      }

      const result = await res.json();
      alert("Vote submitted! Vote ID: " + result.voteID);
      console.log("Vote submitted:", result);

      // Optionally, redirect or clear answers here
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!questionnaire) return <div>Questionnaire not found.</div>;

  return (
    <div
      className="voting-page"
      style={{ padding: "20px", fontFamily: "Arial" }}
    >
      <h1>Questionnaire</h1>
      {questionnaire.criteriaList?.map((criteria, index) => (
        <div
          key={index}
          className="criteria-section"
          style={{ marginBottom: "30px" }}
        >
          <h2>{criteria.title}</h2>
          {criteria.questionList?.map((question, qIndex) => (
            <div
              key={qIndex}
              className="question-block"
              style={{ marginTop: "15px" }}
            >
              <p>
                <strong>
                  Q{qIndex + 1}: {question.title}
                </strong>
              </p>
              {question.optionList && question.optionList.length > 0 ? (
                question.optionList.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="radio"
                      name={question.title}
                      value={option.label}
                      checked={answers[question.title]?.label === option.label}
                      onChange={() =>
                        handleOptionChange(question.title, option.label)
                      }
                      style={{ marginRight: "10px" }}
                    />
                    <span>
                      {option.label} ({option.points} pts)
                    </span>
                  </div>
                ))
              ) : (
                <p>No options available for this question.</p>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Submit Button */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default Voting;

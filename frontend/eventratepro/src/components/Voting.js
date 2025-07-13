import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { auth } from "../firebase/config";
import "./Voting.css";
import { socket } from "../socket";
import erpLogo from "../assets/erp.png";

function Voting() {
  const { questionnaireID, posterID } = useParams();
  const [answers, setAnswers] = useState({});
  const [questionnaire, setQuestionnaire] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "anonym";

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const fetchQuestionnaireAndEvent = async () => {
      try {
        const res = await fetch(
          `https://eventrate-pro.de/${questionnaireID}/${posterID}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setQuestionnaire(data.questionnaire);
        setEvent(data.event);
        const params = new URLSearchParams(window.location.search);
        const role = params.get("role");

        if (role === "referee") {
          // Get current Firebase user
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error("User not authenticated");
          }

          const verifyRes = await fetch(
            "https://eventrate-pro.de/event/isRefereeOfEvent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                eventID: data.event.eventID,
                userEmail: currentUser.email,
              }),
            }
          );

          const verifyResult = await verifyRes.json();
          if (!verifyResult.isReferee) {
            showToast(
              "You are not a registered referee for this event.",
              "error"
            );
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching questionnaire and event:", error);
        showToast("Failed to load questionnaire. Please try again.", "error");
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

  // Get all questions from questionnaire
  const getAllQuestions = () => {
    if (!questionnaire) return [];
    return questionnaire.criteriaList.flatMap((criteria) =>
      criteria.questionList.map((question) => question.title)
    );
  };

  // Validate if all questions are answered
  const validateAnswers = () => {
    const allQuestions = getAllQuestions();
    const answeredQuestions = Object.keys(answers);

    if (answeredQuestions.length !== allQuestions.length) {
      const unansweredCount = allQuestions.length - answeredQuestions.length;
      showToast(
        `Please answer all questions. ${unansweredCount} question${
          unansweredCount > 1 ? "s" : ""
        } remaining.`,
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;

    setIsSubmitting(true);

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
      role: role,
    };

    try {
      const res = await fetch("https://eventrate-pro.de/submitVote", {
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

      // Send vote data via Socket.IO for real-time dashboard updates
      try {
        socket.connect();
        socket.emit("submit_vote_realtime", {
          eventID: event?.eventID,
          posterID: posterID,
          vote: ticketOptionsList,
        });
        console.log("Vote emitted real-time:", ticketOptionsList);
      } catch (socketError) {
        console.log(
          "Socket.IO emission failed, but vote was saved:",
          socketError
        );
      }

      showToast(
        `Vote submitted successfully! Vote ID: ${result.voteID}`,
        "success"
      );
      console.log("Vote submitted:", result);

      // Clear answers after successful submission
      setAnswers({});

      // Optionally redirect after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Error submitting vote:", error);
      showToast("Failed to submit vote. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="voting-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="voting-page">
        <div className="error-container">
          <h2>Questionnaire not found</h2>
          <p>The requested questionnaire could not be loaded.</p>
        </div>
      </div>
    );
  }

  const allQuestions = getAllQuestions();
  const answeredQuestions = Object.keys(answers);
  const progress = (answeredQuestions.length / allQuestions.length) * 100;

  return (
    <div className="voting-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✉" : "⚠"}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="voting-header">
        <div className="logo-section">
          <img src={erpLogo} alt="ERP Logo" className="voting-logo" />
          <h1 className="voting-title">Event Questionnaire</h1>
        </div>
        <div className="role-badge">
          <span className={`role-indicator ${role}`}>
            {role === "referee" ? "👤 Referee" : "🎭 Anonymous"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>
            Progress: {answeredQuestions.length}/{allQuestions.length} questions
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Questionnaire Content */}
      <div className="voting-content">
        {questionnaire.criteriaList?.map((criteria, index) => (
          <div key={index} className="criteria-section">
            <div className="criteria-header">
              <h2 className="criteria-title">{criteria.title}</h2>
              <div className="criteria-badge">Category {index + 1}</div>
            </div>

            <div className="questions-container">
              {criteria.questionList?.map((question, qIndex) => {
                const isAnswered = answers[question.title];
                return (
                  <div
                    key={qIndex}
                    className={`question-block ${isAnswered ? "answered" : ""}`}
                  >
                    <div className="question-header">
                      <h3 className="question-title">
                        <span className="question-number">Q{qIndex + 1}</span>
                        {question.title}
                      </h3>
                    </div>

                    <div className="options-container">
                      {question.optionList && question.optionList.length > 0 ? (
                        question.optionList.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className={`option-item ${
                              answers[question.title]?.label === option.label
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.title}
                              value={option.label}
                              checked={
                                answers[question.title]?.label === option.label
                              }
                              onChange={() =>
                                handleOptionChange(question.title, option.label)
                              }
                              className="option-radio"
                            />
                            <div className="option-content">
                              <span className="option-label">
                                {option.label}
                              </span>
                              <span className="option-points">
                                {option.points} pts
                              </span>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="no-options">
                          No options available for this question.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="submit-section">
        <div className="submit-info">
          <p>
            {answeredQuestions.length === allQuestions.length
              ? "All questions completed! Ready to submit."
              : `Please answer ${
                  allQuestions.length - answeredQuestions.length
                } more question${
                  allQuestions.length - answeredQuestions.length > 1 ? "s" : ""
                }.`}
          </p>
        </div>
        <button
          className={`submit-button ${
            answeredQuestions.length === allQuestions.length
              ? "ready"
              : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={
            isSubmitting || answeredQuestions.length !== allQuestions.length
          }
        >
          {isSubmitting ? (
            <>
              <span className="submit-spinner"></span>
              Submitting...
            </>
          ) : (
            "Submit Vote"
          )}
        </button>
      </div>
    </div>
  );
}

export default Voting;

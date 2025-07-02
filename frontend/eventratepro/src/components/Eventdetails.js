import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./Eventdetails.css";

function EventDetails() {
  const navigate = useNavigate();
  const [Posters, setPosters] = useState([]);
  const [Referee, setReferee] = useState("");
  const [RefereeList, setRefereeList] = useState([]);
  const [refereeEmail, setRefereeEmail] = useState("");

  const location = useLocation();
  const daten = location.state;

  console.log("Received questionnaire-data:", daten);

  const handleAddReferee = (e) => {
    e.preventDefault();

    // checks if input is not empty or only whitespace (trim) and prevents the same email twice
    if (refereeEmail.trim() && !RefereeList.includes(refereeEmail.trim())) {

      // API in order to check the given referee-EMail so that it is a valid refere in Firestore
      fetch(`http://localhost:5000/event/addRefereeToList?email=${refereeEmail}`)
      .then(res => res.json())
      .then(data => {

        // if the given referee is valid, insert it to the RefereeList
        if (data.status === "success") {
          console.log("Valid referee:", data.referee);
          // add referee to the referee-list
          setRefereeList([...RefereeList, refereeEmail.trim()]);
        } else {
          console.error("Validation failed:", data.message);
        }
        setRefereeEmail("");
      });
    }
    console.log(refereeEmail);
  };

  const showPosterQRs = () => {
    Posters.map((poster) => (
      <div key={poster.PosterID}>
        <div className="QRC">{/* TODO: QR Code here */}</div>
        <div className="Postername">{poster.Title}</div>
      </div>
    ));
  };
  //TODO: missing QR code
  // creates new poster and generates its QRCode
  const handleAddPoster = () => {
    const name = prompt("Enter Poster name:");
    if (name) {
      const newPoster = {
        PosterID: Posters.length,
        Title: name,
        content: `http://localhost:3000/${daten.Questionnaire.questionnaireID}/${Posters.length}`,
        eventID: daten.Questionnaire.eventID
      };
      setPosters([...Posters, newPoster]);
      console.log(Posters);
    }
  };

  // remove QR code of a poster
  const handleRemovePoster = (idToRemove) => {
    const updatedPosters = Posters.filter(
      (poster) => poster.PosterID !== idToRemove
    );
    setPosters(updatedPosters);
  }

  // returns items of a list as referee Usernames
  const displayList = () => {
    return RefereeList.map((username, index) => (
      <li key={index}>{username}</li>
    ));
  };

  const handleExportPDF = () => {
    console.log(daten);
    console.log(Posters);
    console.log(RefereeList);

    const event = {
      eventID: daten.Questionnaire.eventID,
      questionnaireID: daten.Questionnaire.questionnaireID,
      itemList: Posters,
      refereeList: RefereeList,
      status: "pending",
      organizerID: daten.userID
    };

    const storeEvent = {
      event: event,
      questionnaire: daten.Questionnaire
    }

    // built-in browser API that allows HTTP requests (GET, POST)
      // fetch = fetch data (GET) + send data (POST)
      fetch('http://localhost:5000/event/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeEvent),
      })

      // wait for the response from backend and parse the response as JSON
      .then(res => res.json())

      // once JSON is parsed, handle the response from the backend and go back to the questionnaire-overview
      .then(response => {
        console.log('Answer from Backend:', response);
        console.log("saved questionaire" );
        //navigate("/questionnaire");
      })

      // if something goes wrong, the error is handled here
      .catch(error => {
        console.error('Error when sending:', error);
      });

  }

  const toEvent = () => {
    navigate("/event");
  };

  // Mock posters for layout
  const mockPosters = [
    { PosterID: 1, Title: "poster 1" },
    { PosterID: 2, Title: "poster 2" },
    { PosterID: 3, Title: "poster 3" },
    { PosterID: 4, Title: "poster 4" },
  ];

  return (
    <div className="eventdetails-main">
      {/* Back Arrow */}
      <div className="eventdetails-back" onClick={() => navigate(-1)}>
        &#8592;
      </div>
      {/* Logo and Title */}
      <div className="eventdetails-header">
        <div className="eventdetails-logo">📝🔍</div>
        <div className="eventdetails-title">EventRate Pro</div>
      </div>
      {/* Main Content */}
      <div className="eventdetails-content">
        {/* Left Section: Posters */}
        <div className="eventdetails-left">
          <div className="eventdetails-poster-grid">
            {Posters.map((poster) => {
              console.log('http://localhost:3000/questionnaire//${poster.PosterID}');
              return (
              <div key={poster.PosterID} className="eventdetails-poster-item">
                <div className="eventdetails-poster-title">{poster.Title}</div>
                <div className="eventdetails-qr-mock">
                  <QRCodeCanvas
                    value={`http://localhost:3000/questionnaire//${poster.PosterID}`}
                    size={90}
                    style={{backgroundColor: "white"}}
                  />
                </div>
                <div className="eventdetails-remove" onClick={() => handleRemovePoster(poster.PosterID)}>×</div>
              </div>
              );
          })}
          </div>
          <div className="eventdetails-add-poster" onClick={handleAddPoster}>+</div>
        </div>
        {/* Right Section: Referee and Buttons */}
        <div className="eventdetails-right eventdetails-right-relative">
          {/* Referee List Box */}
          <div className="eventdetails-referee-list-box">referee list</div>
          {/* Referee Input */}
          <form
            className="eventdetails-referee-form"
            onSubmit={handleAddReferee}
          >
            <input
              className="eventdetails-referee-input"
              type="email"
              placeholder="Enter referee email"
              value={refereeEmail}
              onChange={(e) => setRefereeEmail(e.target.value)}
            />
            <button className="eventdetails-referee-add-btn" type="submit">
              Add
            </button>
          </form>
          {/* Rendered Referee Emails */}
          <ul className="eventdetails-referee-emails">
            {RefereeList.map((email, idx) => (
              <li key={idx}>{email}</li>
            ))}
          </ul>
          {/* Bottom Buttons */}
          <div className="eventdetails-bottom-buttons-fixed">
            <button className="eventdetails-proceed-btn">
              Proceed to Event
            </button>
            <button className="eventdetails-export-btn" onClick={handleExportPDF}>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventDetails;

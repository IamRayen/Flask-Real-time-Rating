import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Eventdetails.css";

function EventDetails() {
  const navigate = useNavigate();
  const [Posters, setPosters] = useState([]);
  const [Referee, setReferee] = useState("");
  const [RefereeList, setRefereeList] = useState([]);
  const [refereeEmail, setRefereeEmail] = useState("");

  const handleReferee = () => {
    const username = "";
    //TODO:API call to check existense of Referee
    // Returns referee Username if email is used
    // ASSIgn return to username;
    if (username) setRefereeList([...RefereeList, username]);
    setReferee("");
  };

  const handleAddReferee = (e) => {
    e.preventDefault();
    if (refereeEmail.trim() && !RefereeList.includes(refereeEmail.trim())) {
      setRefereeList([...RefereeList, refereeEmail.trim()]);
      setRefereeEmail("");
    }
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
        content: "no description",
      };
      setPosters([...Posters, newPoster]);
    }
    //create QR code for Poster
  };
  // returns items of a list as referee Usernames
  const displayList = () => {
    return RefereeList.map((username, index) => (
      <li key={index}>{username}</li>
    ));
  };

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
            {mockPosters.map((poster) => (
              <div key={poster.PosterID} className="eventdetails-poster-item">
                <div className="eventdetails-poster-title">{poster.Title}</div>
                <div className="eventdetails-qr-mock">
                  <span role="img" aria-label="qr">
                    #
                  </span>
                </div>
                <div className="eventdetails-remove">×</div>
              </div>
            ))}
          </div>
          <div className="eventdetails-add-poster">+</div>
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
            <button className="eventdetails-export-btn">Export PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventDetails;

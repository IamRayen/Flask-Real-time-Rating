import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SelectionDashboard.css";
import erpLogo from "../assets/erp.png";

function SelectionDashboard() {
  const { User, logout } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `http://eventrate-pro.de/dashboard/getAllPendingOrRunningEvents?userID=${User.uid}`
        );
        const data = await res.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    if (User?.uid) {
      fetchEvents();
    }
  }, [User]);

  const handleViewEvent = (eventID) => {
    navigate(`/dashboard/${eventID}`);
  };

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  return (
    <div className="dashboard-page">
      <div className="user-header">
        <div className="back-arrow" onClick={handleBackClick}>
          ← Back
        </div>
        <div className="header-logo-container">
          <img src={erpLogo} alt="ERP Logo" className="header-logo" />
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2 className="dashboard-title">My Pending / Running Events</h2>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div>
            <p>No pending or running events found.</p>
            <button
              onClick={() => navigate("/dashboard/default")}
              className="go-to-dashboard-btn"
            >
              Go to Dashboard anyway
            </button>
          </div>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.eventID} className="event-card">
                <h3>{event.title || "Untitled Event"}</h3>
                <p>Status: {event.status}</p>
                <button onClick={() => handleViewEvent(event.eventID)}>
                  View Event
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SelectionDashboard;

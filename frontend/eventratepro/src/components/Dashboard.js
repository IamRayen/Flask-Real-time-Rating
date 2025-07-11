import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import erpLogo from "../assets/erp.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

function Dashboard() {
  const navigate = useNavigate();
  const { eventID } = useParams();

  const participantCount = 24;

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const chartData = {
    labels: ["structure", "content", "creativity", "total score"],
    datasets: [
      {
        label: "poster 1",
        data: [3.0, 4.3, 4.2, 11.5],
        backgroundColor: "#7FB3D5",
        borderWidth: 0,
        barThickness: 40,
      },
      {
        label: "poster 2",
        data: [3.0, 3.6, 4.6, 11.2],
        backgroundColor: "#F0B27A",
        borderWidth: 0,
        barThickness: 40,
      },
      {
        label: "poster 3",
        data: [2.9, 4.3, 4.5, 11.7],
        backgroundColor: "#AAB7B8",
        borderWidth: 0,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          padding: 20,
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value) => value,
        font: {
          size: 12,
          weight: "bold",
        },
        color: "#2C3E50",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 12,
        grid: {
          display: true,
          color: "#E5E7EB",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
  };

  const handleBegin = async () => {
    try {
      const res = await fetch(
        `http://eventrate-pro.de/dashboard/startEvent?eventID=${eventID}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Event started successfully!");
      } else {
        alert("Failed to start event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while starting the event.");
    }
  };

  const handleEnd = async () => {
    try {
      const res = await fetch(
        `http://eventrate-pro.de/dashboard/endEvent?eventID=${eventID}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Event has ended successfully!");
      } else {
        alert("Failed to end event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while ending the event.");
    }
  };

  const getDashboardData = async () => {
    try {
      const res = await fetch(
        `http://eventrate-pro.de/dashboard/getDashboardData?eventID=${eventID}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Found data!");
        console.log(data);
      } else {
        alert("failed to retreive data: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while fetching data.");
    }
  };

  // This state will store the chart data (like votes) that will be updated in real-time.
  const [charts, setCharts] = useState("");
  //Listening for Votes
  useEffect(() => {
    // Connects to the Backend socketIO server. Here just to listen to incomming data.
    socket.connect();

    // Listen for the "submit_vote_realtime" event sent by the Flask server
    socket.on("submit_vote_realtime", (voteData) => {
      console.log("Real-time vote received:", voteData);

      // Update state to reflect the real-time change
      setCharts((prev) => {
        const updated = [...prev];
        // Apply your logic to update based on voteData
        return updated;
      });
    });

    // Cleanup function that runs when the component is unmounted
    // It removes the event listener to prevent memory leaks or duplicate events
    return () => {
      socket.off("submit_vote_realtime");
    };
  }, []);

  return (
    <div className="dashboard-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="participant-count">
            <h2>NUMBER OF PARTICIPANTS: {participantCount}</h2>
          </div>

          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="action-buttons">
            <button className="action-btn begin-btn" onClick={handleBegin}>
              Begin
            </button>
            <button className="action-btn end-btn" onClick={handleEnd}>
              End
            </button>
            <button className="action-btn excel-btn">Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

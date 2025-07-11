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

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  // Chart options configuration
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
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              1
            )} pts`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value) => value.toFixed(1),
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

  // Process vote data to create chart data
  const processVoteData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, questionnaire, event } = dashboardData;

    // Get all criteria from questionnaire
    const criteriaList = questionnaire.criteriaList || [];

    // Get all items (posters) from event
    const itemList = event.itemList || [];

    if (criteriaList.length === 0 || itemList.length === 0) {
      return null;
    }

    // Create a map to store aggregated scores
    const scoresByItem = {};
    const voteCountsByItem = {};

    // Initialize score tracking for each item
    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      scoresByItem[itemKey] = {};
      voteCountsByItem[itemKey] = {};

      criteriaList.forEach((criteria) => {
        scoresByItem[itemKey][criteria.title] = 0;
        voteCountsByItem[itemKey][criteria.title] = 0;
      });
      scoresByItem[itemKey]["total"] = 0;
      voteCountsByItem[itemKey]["total"] = 0;
    });

    // Process each vote
    votes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (!scoresByItem[itemKey]) return;

      let voteTotal = 0;

      // Process each answer in the vote
      vote.ticketOptionsList.forEach((answer) => {
        const criteriaTitle = answer.questionTitle;
        const points = answer.points || 0;

        // Find matching criteria
        const matchingCriteria = criteriaList.find((criteria) =>
          criteria.questionList.some((q) => q.title === criteriaTitle)
        );

        if (matchingCriteria) {
          scoresByItem[itemKey][matchingCriteria.title] += points;
          voteCountsByItem[itemKey][matchingCriteria.title]++;
          voteTotal += points;
        }
      });

      scoresByItem[itemKey]["total"] += voteTotal;
      voteCountsByItem[itemKey]["total"]++;
    });

    // Calculate averages and prepare chart data
    const labels = [...criteriaList.map((c) => c.title), "Total Score"];
    const datasets = [];
    const colors = [
      "#7FB3D5",
      "#F0B27A",
      "#AAB7B8",
      "#85C1E9",
      "#F8C471",
      "#BB8FCE",
      "#82E0AA",
      "#F1948A",
    ];

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      const itemTitle = item.Title || item.title || `Poster ${index + 1}`;

      const data = [];

      // Calculate average scores for each criteria
      criteriaList.forEach((criteria) => {
        const totalScore = scoresByItem[itemKey][criteria.title];
        const voteCount = voteCountsByItem[itemKey][criteria.title];
        const average = voteCount > 0 ? totalScore / voteCount : 0;
        data.push(average);
      });

      // Calculate total average
      const totalScore = scoresByItem[itemKey]["total"];
      const totalVotes = voteCountsByItem[itemKey]["total"];
      const totalAverage = totalVotes > 0 ? totalScore / totalVotes : 0;
      data.push(totalAverage);

      datasets.push({
        label: itemTitle,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderWidth: 0,
        barThickness: 40,
      });
    });

    return {
      labels,
      datasets,
    };
  };

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await fetch(
        `http://eventrate-pro.de/dashboard/getDashboardData?eventID=${eventID}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (res.ok) {
        console.log("Dashboard data fetched:", data);
        setDashboardData(data);

        // Process chart data
        const processedChartData = processVoteData(data);
        setChartData(processedChartData);

        // Calculate participant count (unique voters)
        const uniqueVoters = new Set();
        if (data.votes) {
          data.votes.forEach((vote) => {
            if (vote.role === "referee" && vote.refereeEmail) {
              uniqueVoters.add(vote.refereeEmail);
            } else {
              // For anonymous votes, count each vote as a unique participant
              uniqueVoters.add(vote.voteID);
            }
          });
        }
        setParticipantCount(uniqueVoters.size);
      } else {
        setError("Failed to retrieve data: " + data.error);
        console.error("API Error:", data.error);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle event start
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
        // Refresh data after starting event
        fetchDashboardData();
      } else {
        alert("Failed to start event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while starting the event.");
    }
  };

  // Handle event end
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
        // Refresh data after ending event
        fetchDashboardData();
      } else {
        alert("Failed to end event: " + data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while ending the event.");
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    if (!dashboardData || !dashboardData.votes) {
      alert("No data available for export.");
      return;
    }

    try {
      // Create CSV data
      const csvData = [];
      csvData.push([
        "Vote ID",
        "Item ID",
        "Participant",
        "Question",
        "Answer",
        "Points",
        "Timestamp",
      ]);

      dashboardData.votes.forEach((vote) => {
        vote.ticketOptionsList.forEach((answer) => {
          csvData.push([
            vote.voteID,
            vote.itemID,
            vote.role === "referee"
              ? vote.refereeEmail || "Authenticated User"
              : "Anonymous",
            answer.questionTitle,
            answer.label,
            answer.points,
            new Date().toISOString(), // You might want to add actual timestamp to vote data
          ]);
        });
      });

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `event-${eventID}-results.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };

  // Load data on component mount and set up periodic refresh
  useEffect(() => {
    fetchDashboardData();

    // Set up periodic refresh every 5 seconds for real-time feel
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [eventID]);

  // Render loading state
  if (loading && !dashboardData) {
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
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div>Loading dashboard data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
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
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ color: "red", marginBottom: "1rem" }}>
                Error: {error}
              </div>
              <button onClick={handleRefresh} className="action-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {chartData ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                  minHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {dashboardData?.votes?.length === 0
                  ? "No votes have been submitted yet."
                  : "Loading chart data..."}
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="action-btn begin-btn" onClick={handleBegin}>
              Begin
            </button>
            <button className="action-btn end-btn" onClick={handleEnd}>
              End
            </button>
            <button
              className="action-btn excel-btn"
              onClick={handleExcelExport}
            >
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

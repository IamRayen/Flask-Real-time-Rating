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
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import erpLogo from "../assets/erp.png";
import { dashboardService } from "../services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

function Dashboard() {
  const navigate = useNavigate();
  const { eventID } = useParams();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [chartType, setChartType] = useState("bar");
  const [presentationMode, setPresentationMode] = useState(false);
  const [eventStartTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleBackClick = () => {
    navigate("/account-overview");
  };

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    if (!presentationMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (presentationMode) {
      const interval = setInterval(() => {
        setChartType((prev) => (prev === "bar" ? "pie" : "bar"));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [presentationMode]);

  useEffect(() => {
    if (presentationMode) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [presentationMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setPresentationMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatElapsedTime = () => {
    const elapsed = Math.floor((currentTime - eventStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          padding: presentationMode ? 50 : 30,
          font: {
            size: presentationMode ? 32 : 20,
            weight: "600",
          },
          color: "#2C3E50",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#7FDBDA",
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
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
          size: 14,
          weight: "bold",
        },
        color: "#2C3E50",
        offset: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: presentationMode ? 24 : 18,
            weight: "500",
          },
          color: "#2C3E50",
          padding: 15,
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: "Evaluation Criteria",
          font: {
            size: presentationMode ? 28 : 22,
            weight: "600",
          },
          color: "#2C3E50",
          padding: 0,
        },
        categoryPercentage: 0.9,
        barPercentage: 1.0,
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#E5E7EB",
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: presentationMode ? 22 : 16,
            weight: "500",
          },
          color: "#2C3E50",
          padding: 12,
        },
        title: {
          display: true,
          text: "Average Score (Points)",
          font: {
            size: presentationMode ? 28 : 22,
            weight: "600",
          },
          color: "#2C3E50",
          padding: 25,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
  };

  // Pie chart options configuration
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: presentationMode ? "bottom" : "right",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: presentationMode ? 30 : 20,
          font: {
            size: presentationMode ? 24 : 16,
            weight: "600",
          },
          color: "#2C3E50",
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const backgroundColor = Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor;

                return {
                  text: label,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 2,
                  pointStyle: "circle",
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#7FDBDA",
        borderWidth: 2,
        cornerRadius: 10,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(
              1
            )} pts (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: true,
        color: "#fff",
        font: {
          size: presentationMode ? 20 : 14,
          weight: "bold",
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
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
      "#4A90E2",
      "#F39C12",
      "#8E44AD",
      "#E74C3C",
      "#2ECC71",
      "#16A085",
      "#D35400",
      "#C0392B",
      "#7D3C98",
      "#1ABC9C",
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
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      });
    });

    return {
      labels,
      datasets,
    };
  };

  // Process vote data to create pie chart data
  const processPieChartData = (dashboardData) => {
    if (
      !dashboardData ||
      !dashboardData.votes ||
      !dashboardData.questionnaire
    ) {
      return null;
    }

    const { votes, event } = dashboardData;

    // Get all items (posters) from event
    const itemList = event.itemList || [];

    if (itemList.length === 0) {
      return null;
    }

    // Create a map to store total scores for each item
    const totalScoresByItem = {};
    const voteCountsByItem = {};

    // Initialize score tracking for each item
    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      totalScoresByItem[itemKey] = 0;
      voteCountsByItem[itemKey] = 0;
    });

    // Process each vote to calculate total scores per item
    votes.forEach((vote) => {
      const itemKey = vote.itemID;
      if (totalScoresByItem[itemKey] === undefined) return;

      let voteTotal = 0;

      // Sum all points from this vote
      vote.ticketOptionsList.forEach((answer) => {
        const points = answer.points || 0;
        voteTotal += points;
      });

      totalScoresByItem[itemKey] += voteTotal;
      voteCountsByItem[itemKey]++;
    });

    // Calculate average scores and prepare pie chart data
    const labels = [];
    const data = [];
    const backgroundColors = [
      "#4A90E2",
      "#F39C12",
      "#8E44AD",
      "#E74C3C",
      "#2ECC71",
      "#16A085",
      "#D35400",
      "#C0392B",
      "#7D3C98",
      "#1ABC9C",
    ];

    itemList.forEach((item, index) => {
      const itemKey = item.PosterID || item.posterID || index;
      const itemTitle = item.Title || item.title || `Poster ${index + 1}`;

      const totalScore = totalScoresByItem[itemKey];
      const voteCount = voteCountsByItem[itemKey];
      const averageScore = voteCount > 0 ? totalScore / voteCount : 0;

      if (averageScore > 0) {
        labels.push(itemTitle);
        data.push(averageScore);
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: backgroundColors.slice(0, data.length),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  };

  const processDashboardData = (data) => {
    setDashboardData(data);

    const processedChartData = processVoteData(data);
    setChartData(processedChartData);

    const processedPieChartData = processPieChartData(data);
    setPieChartData(processedPieChartData);

    const uniqueVoters = new Set();
    if (data.votes) {
      data.votes.forEach((vote) => {
        if (vote.role === "referee" && vote.refereeEmail) {
          uniqueVoters.add(vote.refereeEmail);
        } else {
          uniqueVoters.add(vote.voteID);
        }
      });
    }
    setParticipantCount(uniqueVoters.size);
    setLoading(false);
    setError(null);
  };

  const handleRealtimeError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  // Handle event start
  const handleBegin = async () => {
    try {
      const res = await fetch(
        `https://eventrate-pro.de/dashboard/startEvent?eventID=${eventID}`,
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

  // Handle event end
  const handleEnd = async () => {
    try {
      const res = await fetch(
        `https://eventrate-pro.de/dashboard/endEvent?eventID=${eventID}`,
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

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 1000);
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

  useEffect(() => {
    if (!eventID) return;

    dashboardService.subscribeToEventData(
      eventID,
      processDashboardData,
      handleRealtimeError
    );

    return () => {
      dashboardService.unsubscribe();
    };
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
    <div
      className={`dashboard-page ${
        presentationMode ? "presentation-mode" : ""
      }`}
    >
      {!presentationMode && (
        <>
          <div className="back-arrow" onClick={handleBackClick}>
            ← Back
          </div>
          <div className="logo-header">
            <img src={erpLogo} alt="ERP Logo" className="center-logo" />
          </div>
        </>
      )}

      {presentationMode && (
        <div className="presentation-header">
          <div className="presentation-logo">
            <img
              src={erpLogo}
              alt="ERP Logo"
              className="presentation-logo-img"
            />
            <h1 className="presentation-title">
              Event Dashboard - Live Results
            </h1>
          </div>
          <div className="presentation-info">
            <div className="presentation-timer">
              ⏱️ Event Time: {formatElapsedTime()}
            </div>
            <div className="presentation-participants">
              👥 Live Participants: {participantCount}
            </div>
            <div className="presentation-chart-indicator">
              📊 {chartType === "bar" ? "Detailed Scores" : "Overall Rankings"}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div
          className={`dashboard-card ${
            presentationMode ? "presentation-card" : ""
          }`}
        >
          {!presentationMode && (
            <div className="participant-count">
              <h2>NUMBER OF PARTICIPANTS: {participantCount}</h2>
            </div>
          )}

          {!presentationMode && (
            <div className="chart-controls">
              <div className="chart-type-toggle">
                <button
                  className={`toggle-btn ${
                    chartType === "bar" ? "active" : ""
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  📊 Bar Chart
                </button>
                <button
                  className={`toggle-btn ${
                    chartType === "pie" ? "active" : ""
                  }`}
                  onClick={() => setChartType("pie")}
                >
                  🥧 Pie Chart
                </button>
              </div>
            </div>
          )}

          <div className="chart-container">
            {chartType === "bar" ? (
              chartData ? (
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
              )
            ) : pieChartData ? (
              <Pie data={pieChartData} options={pieChartOptions} />
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
                  : "Loading pie chart data..."}
              </div>
            )}
          </div>

          {!presentationMode && (
            <div className="action-buttons">
              {dashboardData?.event?.status === "pending" && (
                <button className="action-btn begin-btn" onClick={handleBegin}>
                  Begin
                </button>
              )}
              <button className="action-btn end-btn" onClick={handleEnd}>
                End
              </button>
              <button
                className="action-btn excel-btn"
                onClick={handleExcelExport}
              >
                Excel
              </button>
              <button
                className="action-btn presentation-btn"
                onClick={togglePresentationMode}
              >
                🖥️ Presentation Mode
              </button>
            </div>
          )}

          {presentationMode && (
            <div className="presentation-actions">
              <button
                className="exit-presentation-btn"
                onClick={togglePresentationMode}
              >
                ✖️ Exit Presentation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import React from "react";
import { useNavigate } from "react-router-dom";
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
import Header from "./sub-component/Header";
import "./Dashboard.css";

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

  return (
    <div className="dashboard-page">
      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>
      <Header icon="ERP" />

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="participant-count">
            <h2>NUMBER OF PARTICIPANTS: {participantCount}</h2>
          </div>

          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="action-buttons">
            <button className="action-btn begin-btn">Begin</button>
            <button className="action-btn end-btn">End</button>
            <button className="action-btn excel-btn">Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

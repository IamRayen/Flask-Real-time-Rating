import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./PDFExport.css";
import erpLogo from "../assets/erp.png";

function PDFExport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { posters, refereeList, eventData } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

  const handleBackClick = () => {
    navigate(-1);
  };

  const generatePDFClientSide = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Colors
      const primaryColor = [103, 126, 234]; // #667eea
      const secondaryColor = [138, 246, 255]; // #8af6ff
      const textColor = [51, 51, 51]; // #333
      const lightGray = [245, 245, 245]; // #f5f5f5

      // Helper function to draw a header box
      const drawHeaderBox = (text, y, color = primaryColor) => {
        pdf.setFillColor(...color);
        pdf.rect(margin, y, contentWidth, 12, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(text, margin + 5, y + 8);
      };

      // Helper function to draw a section divider
      const drawSectionDivider = (y) => {
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
      };

      // Page 1 - Cover Page
      // Header with gradient-like effect
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 80, "F");

      // No logo - clean header

      // Main title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("Event Export Report", pageWidth / 2, 60, { align: "center" });

      // Event details box
      let yPos = 100;
      pdf.setFillColor(...lightGray);
      pdf.rect(margin, yPos, contentWidth, 60, "F");

      pdf.setTextColor(...textColor);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Event Information", margin + 10, yPos + 15);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Event ID: ${eventData?.eventID || "N/A"}`,
        margin + 10,
        yPos + 28
      );
      pdf.text(
        `Status: ${eventData?.status || "Pending"}`,
        margin + 10,
        yPos + 38
      );
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        margin + 10,
        yPos + 48
      );

      // Statistics box
      yPos = 180;
      pdf.setFillColor(...secondaryColor);
      pdf.rect(margin, yPos, contentWidth / 2 - 5, 40, "F");
      pdf.setTextColor(...textColor);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("QR Codes", margin + 10, yPos + 15);
      pdf.setFontSize(20);
      pdf.text(`${posters?.length || 0}`, margin + 10, yPos + 30);

      pdf.setFillColor(...secondaryColor);
      pdf.rect(
        margin + contentWidth / 2 + 5,
        yPos,
        contentWidth / 2 - 5,
        40,
        "F"
      );
      pdf.setFontSize(14);
      pdf.text("Referees", margin + contentWidth / 2 + 15, yPos + 15);
      pdf.setFontSize(20);
      pdf.text(
        `${refereeList?.length || 0}`,
        margin + contentWidth / 2 + 15,
        yPos + 30
      );

      // Referee List Section
      yPos = 240;
      drawHeaderBox("Referee List", yPos);
      yPos += 20;

      pdf.setTextColor(...textColor);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      if (refereeList && refereeList.length > 0) {
        refereeList.forEach((referee, index) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin + 10;
            drawHeaderBox("Referee List (continued)", margin);
            yPos += 20;
          }

          // Alternating row background
          if (index % 2 === 0) {
            pdf.setFillColor(...lightGray);
            pdf.rect(margin, yPos - 4, contentWidth, 8, "F");
          }

          pdf.setTextColor(...textColor);
          pdf.text(`${index + 1}.`, margin + 5, yPos);
          pdf.text(referee, margin + 15, yPos);
          yPos += 8;
        });
      } else {
        pdf.setTextColor(150, 150, 150);
        pdf.setFont("helvetica", "italic");
        pdf.text(
          "No referees have been added to this event.",
          margin + 5,
          yPos
        );
      }

      // QR Codes Section on new pages
      if (posters && posters.length > 0) {
        const QRCode = await import("qrcode");
        const qrCodesPerPage = 2; // Reduced for better layout
        const qrSize = 60; // Size in PDF units

        for (let i = 0; i < posters.length; i += qrCodesPerPage) {
          pdf.addPage();

          // Page header
          drawHeaderBox("QR Codes", margin);
          yPos = margin + 25;

          const pagePosters = posters.slice(i, i + qrCodesPerPage);

          for (let j = 0; j < pagePosters.length; j++) {
            const poster = pagePosters[j];
            const actualIndex = i + j;

            // Create QR code canvas
            const tempCanvas = document.createElement("canvas");
            await QRCode.default.toCanvas(
              tempCanvas,
              poster.content ||
                `http://localhost:3000/questionnaire/${poster.PosterID}`,
              {
                width: 200,
                margin: 2,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
              }
            );

            // QR Code container with border - increased spacing for URL underneath
            const qrY = yPos + j * 130;

            // Background box for QR section - increased height for URL underneath
            pdf.setFillColor(...lightGray);
            pdf.rect(margin, qrY, contentWidth, 110, "F");

            // QR code border
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 10, qrY + 10, qrSize + 4, qrSize + 4, "F");
            pdf.setDrawColor(...textColor);
            pdf.setLineWidth(0.5);
            pdf.rect(margin + 10, qrY + 10, qrSize + 4, qrSize + 4, "S");

            // Add QR code
            const qrImageData = tempCanvas.toDataURL("image/png");
            pdf.addImage(
              qrImageData,
              "PNG",
              margin + 12,
              qrY + 12,
              qrSize,
              qrSize
            );

            // QR Code information
            pdf.setTextColor(...textColor);
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(
              poster.Title || `Poster ${actualIndex + 1}`,
              margin + qrSize + 25,
              qrY + 25
            );

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              "Scan this QR code to access the questionnaire",
              margin + qrSize + 25,
              qrY + 40
            );

            // URL positioned underneath the QR code for more space
            const url =
              poster.content ||
              `http://localhost:3000/questionnaire/${poster.PosterID}`;

            // Position URL underneath QR code
            const urlBoxY = qrY + qrSize + 20;
            const urlBoxWidth = contentWidth - 20; // Full width minus margins for URL
            const boxHeight = 20;

            // URL container box
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 10, urlBoxY, urlBoxWidth, boxHeight, "F");
            pdf.setDrawColor(...primaryColor);
            pdf.rect(margin + 10, urlBoxY, urlBoxWidth, boxHeight, "S");

            // URL label
            pdf.setTextColor(...primaryColor);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text("URL:", margin + 15, urlBoxY + 8);

            // Display URL as a clickable link underneath QR code
            pdf.setTextColor(0, 0, 255); // Blue color for clickable URL
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9); // Readable font size for longer URLs

            // Add URL as a clickable link
            const urlText = url;
            const urlX = margin + 15;
            const urlY = urlBoxY + 16;

            pdf.textWithLink(urlText, urlX, urlY, { url: url });

            // Add underline to show it's clickable
            pdf.setDrawColor(0, 0, 255);
            pdf.setLineWidth(0.3);
            const textWidth = pdf.getTextWidth(urlText);
            pdf.line(urlX, urlY + 1, urlX + textWidth, urlY + 1);
          }
        }
      }

      // Footer on all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(...primaryColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        // Footer text
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("EventRate Pro", margin, pageHeight - 10);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      }

      // Download PDF
      pdf.save(`EventRate-Pro-Export-${eventData?.eventID || "report"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF. Please try again.", "error");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // First, try the backend API
      const response = await fetch("https://eventrate-pro.de/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posters,
          refereeList,
          eventData,
        }),
      });

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `referee-list-${eventData?.eventID || "export"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Automatically start the event after successful PDF download
        await startEventAutomatically();
      } else {
        throw new Error("Backend PDF generation failed");
      }
    } catch (error) {
      console.log(
        "Backend PDF generation failed, using client-side generation"
      );
      // Fallback to client-side PDF generation
      await generatePDFClientSide();

      // Automatically start the event after successful client-side PDF generation
      await startEventAutomatically();
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to automatically start the event
  const startEventAutomatically = async () => {
    if (!eventData?.eventID) {
      console.log("No event ID available for auto-start");
      return;
    }

    try {
      console.log(`Auto-starting event ${eventData.eventID}...`);
      const response = await fetch(
        `https://eventrate-pro.de/dashboard/startEvent?eventID=${eventData.eventID}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Event started automatically after PDF download");
        showToast(
          "PDF downloaded successfully! Event has been started automatically.",
          "success"
        );

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate(`/dashboard/${eventData.eventID}`);
        }, 2000);
      } else {
        console.error("Failed to auto-start event:", data.error);
        showToast(
          "PDF downloaded successfully, but failed to start event automatically. You can start it manually from the dashboard.",
          "error"
        );

        // Still redirect to dashboard
        setTimeout(() => {
          navigate(`/dashboard/${eventData.eventID}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error auto-starting event:", error);
      showToast(
        "PDF downloaded successfully, but failed to start event automatically. You can start it manually from the dashboard.",
        "error"
      );

      // Still redirect to dashboard
      setTimeout(() => {
        navigate(`/dashboard/${eventData.eventID}`);
      }, 3000);
    }
  };

  return (
    <div className="pdf-export-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : "⚠"}
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

      {/* Back Arrow */}
      <div className="back-arrow" onClick={handleBackClick}>
        ← Back
      </div>

      {/* Header */}
      <div className="logo-header">
        <img src={erpLogo} alt="ERP Logo" className="center-logo" />
      </div>

      {/* Main Content */}
      <div className="pdf-export-content">
        {/* Left Section: QR Codes */}
        <div className="pdf-export-left">
          {posters && posters.length > 0 ? (
            posters.map((poster, index) => (
              <div key={poster.PosterID || index} className="pdf-export-poster">
                <div className="pdf-export-qr-container">
                  <QRCodeCanvas
                    value={
                      poster.content ||
                      `http://localhost:3000/questionnaire/${poster.PosterID}`
                    }
                    size={120}
                    style={{ backgroundColor: "white" }}
                  />
                </div>
                <div className="pdf-export-poster-title">
                  {poster.Title || `poster ${index + 1}`}
                </div>
              </div>
            ))
          ) : (
            <div className="pdf-export-no-posters">No posters available</div>
          )}
        </div>

        {/* Right Section: Referee List */}
        <div className="pdf-export-right">
          <div className="pdf-export-referee-header">
            <h2>Referee List</h2>
          </div>

          <div className="pdf-export-referee-list">
            {refereeList && refereeList.length > 0 ? (
              refereeList.map((referee, index) => (
                <div key={index} className="pdf-export-referee-item">
                  {referee}
                </div>
              ))
            ) : (
              <div className="pdf-export-no-referees">No referees added</div>
            )}
          </div>

          {/* Download Button */}
          <div className="pdf-export-download-section">
            <button
              className={`pdf-export-download-btn ${
                isGenerating ? "generating" : ""
              }`}
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating PDF...
                </>
              ) : (
                "Download PDF"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFExport;

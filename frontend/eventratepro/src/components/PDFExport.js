import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./PDFExport.css";

function PDFExport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { posters, refereeList, eventData } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  const generatePDFClientSide = async () => {
    try {
      // Create a temporary container for PDF content
      const pdfContainer = document.createElement("div");
      pdfContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
      `;

      // Create PDF content
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">EventRate Pro</h1>
          <h2 style="color: #667eea; font-size: 20px; margin-bottom: 30px;">Event Export Report</h2>
        </div>
        
        <div style="display: flex; gap: 40px;">
          <div style="flex: 1;">
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">QR Codes</h3>
            ${
              posters && posters.length > 0
                ? posters
                    .map(
                      (poster, index) => `
                <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                  <h4 style="margin: 0 0 10px 0; color: #333;">${
                    poster.Title || `Poster ${index + 1}`
                  }</h4>
                  <div id="qr-${index}" style="margin: 10px 0;"></div>
                  <p style="font-size: 12px; color: #666; word-break: break-all;">${
                    poster.content ||
                    `http://localhost:3000/questionnaire/${poster.PosterID}`
                  }</p>
                </div>
              `
                    )
                    .join("")
                : '<p style="text-align: center; color: #666; font-style: italic;">No posters available</p>'
            }
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Referee List</h3>
            ${
              refereeList && refereeList.length > 0
                ? `<div style="margin-top: 20px;">
                ${refereeList
                  .map(
                    (referee, index) => `
                  <div style="padding: 10px; margin: 8px 0; background: #f8f9ff; border-left: 4px solid #667eea; border-radius: 4px;">
                    ${referee}
                  </div>
                `
                  )
                  .join("")}
              </div>`
                : '<p style="text-align: center; color: #666; font-style: italic; margin-top: 20px;">No referees added</p>'
            }
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      `;

      document.body.appendChild(pdfContainer);

      // Generate QR codes for PDF
      if (posters && posters.length > 0) {
        const QRCode = await import("qrcode");
        for (let i = 0; i < posters.length; i++) {
          const qrContainer = document.getElementById(`qr-${i}`);
          if (qrContainer) {
            const canvas = document.createElement("canvas");
            await QRCode.default.toCanvas(
              canvas,
              posters[i].content ||
                `http://localhost:3000/questionnaire/${posters[i].PosterID}`,
              {
                width: 120,
                margin: 2,
              }
            );
            qrContainer.appendChild(canvas);
          }
        }
      }

      // Generate PDF
      const canvas = await html2canvas(pdfContainer, {
        useCORS: true,
        scale: 2,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(pdfContainer);

      // Download PDF
      pdf.save(`referee-list-${eventData?.eventID || "export"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);

      // First, try the backend API
      const response = await fetch("http://127.0.0.1:5000/export/pdf", {
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
      } else {
        throw new Error("Backend PDF generation failed");
      }
    } catch (error) {
      console.log(
        "Backend PDF generation failed, using client-side generation"
      );
      // Fallback to client-side PDF generation
      await generatePDFClientSide();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-export-page">
      {/* Back Arrow */}
      <div className="pdf-export-back" onClick={handleBackClick}>
        ←
      </div>

      {/* Header */}
      <div className="pdf-export-header">
        <div className="pdf-export-logo">📝🔍</div>
        <div className="pdf-export-title">EventRate Pro</div>
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

import React from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./QRCode.css";
import Header from "./sub-component/Header";

function QRCode() {
    const id = 'questionnaire-id';
    const url = 'http://localhost:3000/questionnaire/${id}';
    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate("/create-questionnaire");
      };


    return (

        <div className="qrcode-page">
            <div className="back-arrow" onClick={handleBackClick}>
            ←
            </div>
            <Header icon="ERP"/>

            <div>
                <QRCodeCanvas value = {url} size={256} />
                <h2>Scan to Open Questionnaire</h2>
                <p>{url}</p>
            </div>
        </div>


    );

}

export default QRCode;
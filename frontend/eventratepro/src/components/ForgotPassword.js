import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import Header from "./sub-component/Header";
import NewPasswordForm from "./sub-component/NewPasswordForm";
import ResetCodeForm from "./sub-component/ResetCodeForm";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const [keyRequested,setKeyRequested]=useState(false);



  
//📋🔍
  return (
    <div className="forgot-password-page">
      <Header icon="🔍" />
      <div className="forgot-password-form">

        <ResetCodeForm signal={setKeyRequested}
         email={email}
         setEmail={setEmail}/>

      { keyRequested&& <NewPasswordForm
          securityCode={securityCode}
          setSecurityCode={setSecurityCode}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
      /> }

      </div> 
    </div>
  );
}

export default ForgotPassword;

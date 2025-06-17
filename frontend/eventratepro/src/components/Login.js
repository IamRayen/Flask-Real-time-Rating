import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuthContext } from "../context/AuthContext";
import Header from "./sub-component/Header";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const {setUser}=useAuthContext();

  const handleLogin = () => {
    // Navigate to account overview
    //TODO: used for testing :  testcases{null,notnull}: Null:block redirect
    // after implementing backend API , use setUser to update user login status
    setUser(email===""? null:{id:1,mail:email});  
    navigate("/account-overview");
  };

  const handleRegister = () => {
    // Navigate to register page
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-page">
      <Header icon="ERP"/>

      <form className="personalinfor" onSubmit={(e) => {
  e.preventDefault(); // prevents react from reloading page
  handleLogin(); //allows ENTER to submit without clicking button
}}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          className="u-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login" type="submit">
        Log in
      </button>
      </form>

      

      <div className="forgot-password-link">
        <span onClick={handleForgotPassword}>
          Forgot your password? Click here to recover it!
        </span>
      </div>

      <button className="login-register-btn" onClick={handleRegister}>
        <span>No account?</span>
        <span>Register NOW!</span>
      </button>
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Header from "./sub-component/Header";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const isComplete = email && username && password && confirmPassword && password === confirmPassword;

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;}
      // TODO: Add  registration logic here (API call)
    // Navigate to login page after registration
    navigate("/login");
  };

  return (
    <div className="register-page">
      <Header icon="ERP"/>

      <form className="reginfor"onSubmit={(e) => {
  e.preventDefault(); // prevents react from unnecesarry reloading page
  handleRegister(); //allows ENTER and Button to submit 
}}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="username">Username</label>
        <input
          id="username"
          className="n-text"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          className="p-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="pass2">Confirm your password</label>
        <input
          id="pass2"
          className="c-text"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
         <button className="register" type="submit"disabled={!isComplete}>
        Register
      </button>
      </form>

     
    </div>
  );
}

export default Register;

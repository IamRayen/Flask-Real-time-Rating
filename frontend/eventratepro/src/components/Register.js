import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import "./Register.css";
import Header from "./sub-component/Header";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isComplete = email && username && password && confirmPassword && password === confirmPassword;

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(userCredential.user, {
        displayName: username
      });

      // write user-data in Firestore
      // TODO: differentiate organizer and Referee when register (right now, it's only organizer)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        role: "organizer"
      });
      
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header icon="ERP"/>

      <form className="reginfor" onSubmit={(e) => {
  e.preventDefault();
  handleRegister();
}}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          className="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="username">Username</label>
        <input
          id="username"
          className="n-text"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          className="p-text"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="pass2">Confirm your password</label>
        <input
          id="pass2"
          className="c-text"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <button className="register" type="submit" disabled={!isComplete || loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

     
    </div>
  );
}

export default Register;

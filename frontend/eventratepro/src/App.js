import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AccountOverview from "./components/AccountOverview";
import ForgotPassword from "./components/ForgotPassword";
import Questionnaire from "./components/Questionnaire";
import CreateQuestionnaire from "./components/CreateQuestionnaire";
import LoginGuard from "./context/AuthGuard";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="App">
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account-overview" element={<LoginGuard> <AccountOverview /> </LoginGuard>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route
            path="/create-questionnaire"
            element={<LoginGuard> <CreateQuestionnaire /> </LoginGuard>}
          />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

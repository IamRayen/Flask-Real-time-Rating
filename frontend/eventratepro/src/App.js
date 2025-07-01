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
import Questionnaire from "./components/Questionnaire";
import CreateQuestionnaire from "./components/CreateQuestionnaire";
import LoginGuard from "./context/AuthGuard";
import { AuthProvider } from "./context/AuthContext";
import QRCode from "./components/QRCode";
import EventDetails from "./components/Eventdetails";

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
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route
            path="/create-questionnaire"
            element={<LoginGuard> <CreateQuestionnaire /> </LoginGuard>}
          />
          <Route path="/qr-code" element={<QRCode />} />
          <Route path="/event-details" element={< EventDetails/>} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

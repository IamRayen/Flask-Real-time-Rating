import React from "react";
import { useNavigate, useParams } from "react-router-dom";

function VoteRoleSelection() {
  const navigate = useNavigate();
  const { questionnaireID, posterID } = useParams();

  const handleChoice = (role) => {
    if (role === "referee") {
      navigate(`/login?next=/vote/${questionnaireID}/${posterID}&role=referee`);
    } else {
      navigate(`/vote/${questionnaireID}/${posterID}?role=anonym`);
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>Vote as:</h2>
      <button onClick={() => handleChoice("referee")}>Referee</button>
      <button onClick={() => handleChoice("anonym")} style={{ marginLeft: "10px" }}>
        Anonym
      </button>
    </div>
  );
}

export default VoteRoleSelection;
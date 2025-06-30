import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RefereeQR(){
    const navigate= useNavigate();
    const [Posters,setPosters]=useState([]);
    const [Referee,setReferee]=useState("");
    const [RefereeList,setRefereeList]=useState([]);

    const handleReferee=()=>{
        const username="";
        //TODO:API call to check existense of Referee
        // Returns referee Username if email is used
        // ASSIgn return to username;
        if(username) setRefereeList([...RefereeList,username]);
        setReferee("");
    };
    const showPosterQRs=()=>{
        Posters.map((poster) => (
          <div key={poster.PosterID}> 
            <div className="QRC">{/* TODO: QR Code here */}</div>
            <div className="Postername">{poster.Title}</div>
          </div>
        ));
      
    };
    //TODO: missing QR code 
    // creates new poster and generates its QRCode
   const handleAddPoster = () => {
            const name = prompt("Enter Poster name:");
            if (name) {
              const newPoster = {
                PosterID: Posters.length,
                Title: name,
                content: "no description",
              };
              setPosters([...Posters, newPoster]);
            }
            //create QR code for Poster
     };
     // returns items of a list as referee Usernames
     const displayList = () => {
        return RefereeList.map((username, index) => (
          <li key={index}>{username}</li>
        ));
      };
          
     const toEvent=()=>{
        navigate("/event")
     }
    
return(
    <div className="Main page">
        <div className="left-Section">
            <div className="QR-container">
                {showPosterQRs()}
                <div className="addPoster" onClick={handleAddPoster}>+</div>
            </div>
        </div>
        <div className="right-section">
            <div className="Referee-container"></div>
            <form onSubmit={(e)=>{e.preventDefault();
                handleReferee()}}>
                <label htmlFor="ref">Referee Selection </label>
                <input type="text"
                 id="ref" 
                 value={Referee}
                 placeholder="Enter referee username or email"
                 onChange={(e)=>setReferee(e.target.value)}></input>
                <button type="submit"className="add-button"> add </button>
            </form>
            <div className="Referee-list">
                <ul>{displayList()}</ul>
            </div>
            <div className="Buttons-Container">
               <button className="Downloadpdf">Download Event Information</button> 
               <button onClick={toEvent}>Proceed to Event</button>
            </div>
        </div>
    </div>
);
}
export default RefereeQR;
import { useState } from "react";
import "./App.css";
import LiveScores from "./Components/LiveScores/LiveScores";
import Calendar from "./Components/Calendar/Calendar";
import Match from "./Components/Match/Match";
import LeagueInfo from "./Components/LeagueInfo/LeagueInfo";
import TeamInfo from "./Components/TeamInfo/TeamInfo";
import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header/Header";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="App">
      

      <Routes>
        <Route
          path="/"
          element={
            <div className="homepage">
              <Calendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <div className="content-container">
                <LiveScores
                  selectedDate={selectedDate}
                  setSelectedMatch={setSelectedMatch}
                />
                <Match selectedMatch={selectedMatch} />
              </div>
            </div>
          }
        />
        <Route path="/league/:leagueId" element={<LeagueInfo />} />
        <Route path="/team/:teamId" element={<TeamInfo />} />
      </Routes>
    </div>
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import LiveScores from "./Components/LiveScores/LiveScores";
import Calendar from "./Components/Calendar/Calendar";
import Match from "./Components/Match/Match";
import LeagueInfo from "./Components/LeagueInfo/LeagueInfo";
import TeamInfo from "./Components/TeamInfo/TeamInfo";
import { Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import SearchPage from "./Components/SearchPage/SearchPage";


function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState(null);

   return (
    <div className="layout-wrapper">
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
                </div>
              </div>
            }
          />
          <Route path="/match/:matchId" element={<Match />} />
          <Route path="/league/:leagueId" element={<LeagueInfo />} />
          <Route path="/team/:teamId" element={<TeamInfo />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

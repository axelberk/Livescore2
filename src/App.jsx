import { useState } from 'react'
import './App.css'
import LiveScores from './Components/LiveScores/LiveScores'
import Calendar from "./Components/Calendar/Calendar"
import Match from "./Components/Match/Match"
import LeagueInfo from './Components/LeagueInfo/LeagueInfo'
import { Routes, Route } from 'react-router-dom'

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMatch, setSelectedMatch] = useState(null)

  return (
    <div className='App'>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <Routes>
        <Route
          path="/"
          element={
            <div className='content-container'>
              <LiveScores selectedDate={selectedDate} setSelectedMatch={setSelectedMatch} />
              <Match selectedMatch={selectedMatch}/>
            </div>
          }
        />
        <Route path="/league/:leagueId" element={<LeagueInfo />} />
        {/* <Route path="/team/:teamId" element={<TeamInfo />} /> */}
      </Routes>
    </div>
  )
}

export default App

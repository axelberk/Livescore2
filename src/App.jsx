import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import LiveScores from './Components/LiveScores/LiveScores'
import Calendar from "./Components/Calendar/Calendar";
import Match from "./Components/Match/Match"
import LeagueInfo from './Components/LeagueInfo/LeagueInfo';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMatch, setSelectedMatch] = useState(null)
  
  return (
    <div className='App'>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
      <div className='content-container'>
         <LiveScores selectedDate={selectedDate} setSelectedMatch={setSelectedMatch}/>
         <Match selectedMatch={selectedMatch}/>
      </div>
     
    </div>
   
  )
}

export default App

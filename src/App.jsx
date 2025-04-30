import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import LiveScores from './Components/LiveScores/LiveScores'
import Calendar from "./Components/Calendar/Calendar";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  return (
    <div className='App'>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
      <div className='content-container'>
         <LiveScores selectedDate={selectedDate}/>
      </div>
     
    </div>
   
  )
}

export default App

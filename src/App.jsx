import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import LiveScores from './LiveScores'
import Calendar from "./Components/Calendar";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  return (
    <div className='App'>
      <Calendar/>
      {/* <LiveScores/> */}
    </div>
   
  )
}

export default App

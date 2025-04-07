import { useState, useEffect } from "react"
import axios from "axios"

const LiveScores = () => {
    const [matches, setMatches] = useState([])
  
    useEffect (() => {
      const fetchLiveMatches = async () => {
        try {
          const response = await axios.get("https://v3.football.api-sports.io/fixtures?live=all", {
            headers: {
            "x-apisports-key": process.env.REACT_APP_API_FOOTBALL_KEY
            }
          })
        } catch (error) {
          console.error("Error fetching live scores", error)
        }
      }
  
      fetchLiveMatches()
    }, [])
  }

  export default LiveScores
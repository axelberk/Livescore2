import { useState, useEffect } from "react"
import axios from "axios"
import "./LiveScores.css"

const LiveScores = () => {
    const [matches, setMatches] = useState([])
  
    useEffect (() => {
      const fetchLiveMatches = async () => {
        try {
          const response = await axios.get("https://v3.football.api-sports.io/fixtures?live=all", {
            headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY
            }
            
          })
          console.log("API response:", response.data);
          setMatches(response.data.response)

        } catch (error) {
          console.error("Error fetching live scores", error)
        }
      }

      
  
      fetchLiveMatches()
    }, [])

    return (
      <div className="Livescores">
        <h2>Matches</h2>
        {matches.length === 0 ? (
          <p>No matches today.</p>
        ) : (
          matches.map(match => (
            <div key={match.fixture.id}>
              {match.teams.home.name} vs {match.teams.away.name} — {match.goals.home}:{match.goals.away}
            </div>
          ))
        )}
      </div>
    );
  }

  export default LiveScores
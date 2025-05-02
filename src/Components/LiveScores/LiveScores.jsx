import { useState, useEffect } from "react"
import axios from "axios"
import "./LiveScores.css"

const allowedLeagues = [39, 113, 140, 2, 848]

const LiveScores = ({selectedDate, setSelectedMatch}) => {
    const [matches, setMatches] = useState([])
  
    useEffect (() => {
      const fetchLiveMatches = async () => {
        const formattedDate = selectedDate.toISOString().split("T")[0]

        try {
          const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
            headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY
            },
            params: {
              date:formattedDate,
            }
            
          })

          const filtered = response.data.response.filter(match => 
            allowedLeagues.includes(match.league.id)
          )

          setMatches(filtered)

        } catch (error) {
          console.error("Error fetching live scores", error)
        }
      }

      
  
      fetchLiveMatches()
    }, [selectedDate])

    return (
      <div className="Livescores">
        <h2>Fixtures</h2>
        {matches.length === 0 ? (
          <p>No fixtures today.</p>
        ) : (
          matches.map(match => (
            <div key={match.fixture.id}
            className="match-card"
            onClick={() => setSelectedMatch(match)}
            >
            <strong>{match.league.name}</strong><br />
            {match.teams.home.name} vs {match.teams.away.name} -{" "}
            {match.goals.home}-{match.goals.away}
          </div>
          ))
        )}
      </div>
    );
  }

  export default LiveScores
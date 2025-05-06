import { useState, useEffect } from "react"
import axios from "axios"
import "./LiveScores.css"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from "react-router-dom";
import LeagueInfo from "../LeagueInfo/LeagueInfo";

const allowedLeagues = [39, 113, 140, 2, 848, 3, 78, 61, 135] 

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
          Object.entries(
            matches.reduce((acc, match) => {
              const leagueName = match.league.name;
              if (!acc[leagueName]) acc[leagueName] = [];
              acc[leagueName].push(match);
              return acc;
            }, {})
          ).map(([leagueName, leagueMatches]) => (
            <div key={leagueName} className="league-name">
              <Link to={`/league/${leagueMatches[0].league.id}`}>
                <strong>{leagueMatches[0].league.name}<ArrowRightIcon/></strong>
                
              </Link>
              {leagueMatches.map((match) => (
                <div
                  key={match.fixture.id}
                  className="match-card"
                  onClick={() => setSelectedMatch(match)}
                >
                  {new Date(match.fixture.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  — {match.teams.home.name} vs {match.teams.away.name} -{" "}
                  {match.goals.home}-{match.goals.away}
                </div>
              ))}
            </div>
          ))
          
        )}
      </div>
    );
    
  }

  export default LiveScores
import "./LeagueInfo.css"
import { useParams } from "react-router"
import { useState, useEffect } from "react"
import axios, { Axios } from "axios"

const LeagueInfo = () => {
    const { leagueId } = useParams();
    const [league, setLeague] = useState(null);

    const latestSeason = league.seasons.find(season => season.current);
  
    useEffect(() => {
      const fetchLeague = async () => {
        try {
          const res = await axios.get("https://v3.football.api-sports.io/leagues", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              id: leagueId,
            },
          });
          setLeague(res.data.response[0]);
        } catch (err) {
          console.error("Failed to fetch league info:", err);
        }
      };
  
      fetchLeague();
    }, [leagueId]);

    if (!league) return <div>Loading league info...</div>;

    return (
        <div>
          <h2>{league.league.name}</h2>
         
          <img src={league.league.logo} alt="League logo" style={{ height: 40 }} />
          
          <p>Season: {latestSeason.year}</p>
        </div>
      );
}

export default LeagueInfo
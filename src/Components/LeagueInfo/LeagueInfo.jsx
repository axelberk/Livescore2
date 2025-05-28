import "./LeagueInfo.css";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import axios, { Axios } from "axios";
import Header from "../Header/Header";

const LeagueInfo = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);

  useEffect(() => {
    if (!league) return;
    const fetchDetails = async () => {
      try {
        const season = league.seasons.find((season) => season.current)?.year;

        const [standingsRes, scorersRes] = await Promise.all([
          axios.get("https://v3.football.api-sports.io/standings", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              league: leagueId,
              season,
            },
          }),
          axios.get("https://v3.football.api-sports.io/players/topscorers", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              league: leagueId,
              season,
            },
          }),
        ]);

        setStandings(standingsRes.data.response[0].league.standings[0]);
        setTopScorers(scorersRes.data.response);
      } catch (err) {
        console.error("Failed to fetch additional league data:", err);
      }
    };

    fetchDetails();
  }, [league, leagueId]);

  if (!league) return <div>Loading league info...</div>;

  const latestSeason = league.seasons.find((season) => season.current);

  return (
    <div>
      <Header />
      <h2>{league.league.name}</h2>

      <img src={league.league.logo} alt="League logo" style={{ height: 40 }} />

      
      <div>
        <div className="league-container">
          <h3>League Phase</h3>
          <div className="league-table">
          {standings.map((team) => (
            
            <div key={team.team.id} className="league-phase">
              {team.rank}. {team.team.name} - {team.points} pts
            </div>
          ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LeagueInfo;

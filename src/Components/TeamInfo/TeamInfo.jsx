import { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./TeamInfo.css";
import axios from "axios";


const currentSeason = "2024";

const TeamInfo = () => {
  const { teamId } = useParams();
  const [teamPage, setTeamPage] = useState(null);
  const [squad, setSquad] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchTeamInfoAndSquad = async () => {
    try {
      const [teamRes, squadRes, resultsRes] = await Promise.all([
        axios.get("https://v3.football.api-sports.io/teams", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: { id: teamId },
        }),
        axios.get("https://v3.football.api-sports.io/players", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: {
            team: teamId,
            season: currentSeason,
          },
        }),
        axios.get("https://v3.football.api-sports.io/fixtures", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: {
            team: teamId,
            season: currentSeason,
            last: 5,
          },
        }),
      ]);

      setTeamPage(teamRes.data.response[0]);
      const players = squadRes.data.response.map((entry) => entry.player);
      setSquad(players);
      setResults(resultsRes.data.response);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTeamInfoAndSquad();
}, [teamId]);


  if (loading) return <p>Loading team info...</p>;
  if (!teamPage) return <p>Team not found.</p>;

  const { team, venue } = teamPage;
  

  return (
    <div className="team-info-main">
    <div className="facts-container">
      <img src={team.logo} alt="logo" className="team-info-logo"/>
      <div className="team-facts">
        
        <h2>{team.name}</h2>
        <p>Established {team.founded}</p>
        <p>{venue.city}, {team.country}</p>
        <p>
          {venue.name} - {venue.capacity}
        </p>
      </div>
      </div>
      <div className="teaminfo-container">
      <div className="squad">
        <h3>Squad</h3>
        {Object.entries(
          squad.reduce((acc, player) => {
            const position = player.position || "Unknown";
            if (!acc[position]) acc[position] = [];
            acc[position].push(player);
            return acc;
          }, {})
        ).map(([position, players]) => (
          <div key={position} className="squad-group">
            <h4>{position}</h4>
            <ul className="squad-list">
              {players.map((player) => (
                <li key={player.id}>
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="player-photo"
                  />
                  {player.name} ({player.age} years)
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="results">
<h3>Results</h3>
  <div className="results-list">
    {results.map((fixture) => {
      const { id, date, teams, goals } = fixture;
      const home = teams.home.name;
      const away = teams.away.name;
      const score = `${goals.home} - ${goals.away}`;
      const matchDate = new Date(date).toLocaleDateString();

      return (
        <div key={id} className="result-item">
          <strong>{matchDate}</strong>: {home} {score} {away}
        </div>
      );
    })}
  </div>
      </div>
    </div>
    </div>
  );
};

export default TeamInfo;
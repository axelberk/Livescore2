import { useEffect, useState } from "react";
import axios from "axios";
import "./Match.css";

const Match = ({ selectedMatch }) => {
  const [lineups, setLineups] = useState(null);

  useEffect(() => {
    const fetchLineups = async () => {
      if (!selectedMatch) return;
      try {
        const response = await axios.get(
          `https://v3.football.api-sports.io/fixtures/lineups`,
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              fixture: selectedMatch.fixture.id,
            },
          }
        );
        setLineups(response.data.response);
      } catch (error) {
        console.error("Error fetching lineups:", error);
      }
    };

    fetchLineups();
  }, [selectedMatch]);

  if (!selectedMatch) return <div className="Match">Select a match to view details</div>;
  if (!lineups) return <div className="Match">Loading lineups...</div>;

  return (
    <div className="Match">
      <h3>{selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}</h3>
      {lineups.map(team => (
        <div key={team.team.id}>
          <h4>{team.team.name} — {team.formation}</h4>
          <ul>
            {team.startXI.map(player => (
              <li key={player.player.id}>
                #{player.player.number} {player.player.name} ({player.player.pos})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Match;

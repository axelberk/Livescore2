import { useEffect, useState } from "react";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";

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
      <div className="pitch-container">
        {lineups.map(team => (
          <Lineup key={team.team.id} team={team} color={team.team.id === selectedMatch.teams.home.id ? "#03A9F4" : "#F44336"} />
        ))}
      </div>
    </div>
  );
};

export default Match;

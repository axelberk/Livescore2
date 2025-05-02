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

  const homeTeam = lineups.find(team => team.team.id === selectedMatch.teams.home.id);
const awayTeam = lineups.find(team => team.team.id === selectedMatch.teams.away.id);

return (
  <div className="Match">
    <h3>{selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}</h3>
    <div className="pitch-wrapper vertical">
      <div className="pitch-side">
        <Lineup team={homeTeam} color="#03A9F4" />
      </div>

      <div className="pitch-divider horizontal">
        <div className="center-circle horizontal-circle"></div>
      </div>

      <div className="pitch-side">
        <Lineup team={awayTeam} color="#F44336" />
      </div>
    </div>
  </div>
);

};

export default Match;

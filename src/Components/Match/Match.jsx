import { useEffect, useState } from "react";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";

const Match = ({ selectedMatch }) => {
  const [lineups, setLineups] = useState(null);
  const [goalScorerIds, setGoalScorerIds] = useState(new Set());

  
  useEffect(() => {
    if (!selectedMatch) return;
  
    const fetchLineupsAndEvents = async () => {
      try {
        const [lineupsRes, eventsRes] = await Promise.all([
          axios.get(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${selectedMatch.fixture.id}`, {
            headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY }
          }),
          axios.get(`https://v3.football.api-sports.io/fixtures/events?fixture=${selectedMatch.fixture.id}`, {
            headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY }
          })
        ]);
  
        setLineups(lineupsRes.data.response);
  
        const goals = eventsRes.data.response
          .filter(event => event.type === "Goal" && event.player)
          .map(event => event.player.id);
  
        setGoalScorerIds(new Set(goals));
      } catch (err) {
        console.error("Error fetching match data:", err);
      }
    };
  
    fetchLineupsAndEvents();
  }, [selectedMatch]);


  if (!selectedMatch) return <div className="Match">Select a match to view details</div>;
  if (!lineups) return <div className="Match">Loading lineups...</div>;

  const homeTeam = lineups.find(
    (team) => team.team.id === selectedMatch.teams.home.id
  );
  const awayTeam = lineups.find(
    (team) => team.team.id === selectedMatch.teams.away.id
  );

  return (
    <div className="Match">
      <h3>{selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}</h3>
      <div className="pitch-wrapper vertical">
        {homeTeam && (
          <div className="pitch-side">
            <Lineup team={homeTeam} color="#03A9F4" goalScorerIds={goalScorerIds}/>
          </div>
        )}

        <div className="pitch-divider horizontal">
          <div className="center-circle horizontal-circle"></div>
        </div>

        {awayTeam && (
          <div className="pitch-side">
            <Lineup team={awayTeam} color="#F44336" isAway goalScorerIds={goalScorerIds}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Match;

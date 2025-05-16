import { useEffect, useState } from "react";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import { Skeleton, Box } from "@mui/material";

const MatchSkeleton = () => (
  <Box padding={2}>
    <div style={{display:"flex", justifyContent:"center"}}>
    <Skeleton variant="text" width="50%" height={30}/>
    </div>
    <Skeleton variant="rectangular" height={220} sx={{ my: 2 }} />
    <Skeleton variant="rectangular" height={220} sx={{ mt: 1 }} />
  </Box>
);

const Match = ({ selectedMatch }) => {
  const [lineups, setLineups] = useState(null);
  const [goalScorerIds, setGoalScorerIds] = useState(new Set());
  const [substitutions, setSubstitutions] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedMatch) return;

    const fetchLineupsAndEvents = async () => {
      setLoading(true);
      try {
        const [lineupsRes, eventsRes] = await Promise.all([
          axios.get(
            `https://v3.football.api-sports.io/fixtures/lineups?fixture=${selectedMatch.fixture.id}`,
            {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
            }
          ),
          axios.get(
            `https://v3.football.api-sports.io/fixtures/events?fixture=${selectedMatch.fixture.id}`,
            {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
            }
          ),
        ]);

        setLineups(lineupsRes.data.response);

        const allEvents = eventsRes.data.response

       const substitutions = eventsRes.data.response
          .filter((event) => event.type === "subst")
          .map((event) => ({
            player_in: event.assist,
            player_out: event.player,
            team: event.team,
            time: event.time.elapsed,
          }));

          setSubstitutions(substitutions)

        // const goals = eventsRes.data.response
        //   .filter((event) => event.type === "Goal" && event.player)
        //   .map((event) => event.player.id);

        // setGoalScorerIds(new Set(goals));

        const goalCounts = new Map()

        eventsRes.data.response.forEach((event) => {
          if (event.type === "Goal" && event.player?.id) {
            const playerId = event.player.id
            goalCounts.set(playerId, (goalCounts.get(playerId) || 0) + 1)
          }
        })

        setGoalScorerIds(goalCounts)

      } catch (err) {
        console.error("Error fetching match data:", err);
      } finally {
        setLoading(false);
      }
    };

 

    fetchLineupsAndEvents();
  }, [selectedMatch]);

  if (!selectedMatch)
    return <div className="Match">Select a match to view details</div>;
  if (!lineups) return <div className="Match">Loading lineups...</div>;

  const homeTeam = lineups.find(
    (team) => team.team.id === selectedMatch.teams.home.id
  );
  const awayTeam = lineups.find(
    (team) => team.team.id === selectedMatch.teams.away.id
  );

  const homeSubstitutions = substitutions.filter(
    (s) => s.team.id === selectedMatch.teams.home.id
  )

  const awaySubstitutions = substitutions.filter(
    (s) => s.team.id === selectedMatch.teams.away.id
  )


  return (
    <div className="Match">
      {loading ? (
        <MatchSkeleton />
      ) : (
        <>
          <div className="match-header">
  <div className="team-info">
    <img
      src={selectedMatch.teams.home.logo}
      alt={selectedMatch.teams.home.name}
      className="match-team-logo"
    />
    <span>{selectedMatch.teams.home.name}</span>
  </div>
<div className="match-scores">
  {selectedMatch.goals.home} - {selectedMatch.goals.away}
</div>
  <div className="team-info">
    <span>{selectedMatch.teams.away.name}</span>
    <img
      src={selectedMatch.teams.away.logo}
      alt={selectedMatch.teams.away.name}
      className="match-team-logo"
    />
  </div>
</div>
          <div className="pitch-wrapper vertical">
            {homeTeam && (
              <div className="pitch-side">
                <Lineup
                  team={homeTeam}
                  color="#03A9F4"
                  goalCounts={goalScorerIds}
                  substitutes={homeTeam.substitutes}
                  substitutions={homeSubstitutions}
                />
              </div>
            )}

            <div className="pitch-divider horizontal">
              <div className="center-circle horizontal-circle"></div>
            </div>

            {awayTeam && (
              <div className="pitch-side">
                <Lineup
                  team={awayTeam}
                  color="#F44336"
                  isAway
                  goalCounts={goalScorerIds}
                  substitutes={awayTeam.substitutes}
                  substitutions={awaySubstitutions}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Match;

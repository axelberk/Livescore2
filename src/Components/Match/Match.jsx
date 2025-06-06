import { useEffect, useState } from "react";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import { Skeleton, Box } from "@mui/material";
import { Link } from "react-router-dom";

const MatchSkeleton = () => (
  <Box padding={2}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Skeleton variant="text" width="50%" height={30} />
    </div>
    <Skeleton variant="rectangular" height={220} sx={{ my: 2 }} />
    <Skeleton variant="rectangular" height={220} sx={{ mt: 1 }} />
  </Box>
);

const Match = ({ selectedMatch }) => {
  const [lineups, setLineups] = useState(null);
  const [goalScorerIds, setGoalScorerIds] = useState(new Map());
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!selectedMatch) return;

    const fetchLineupsAndEvents = async () => {
      setLoading(true);
      try {
        const headers = {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
        };

        const fixtureId = selectedMatch.fixture.id;

        const [lineupsRes, eventsRes] = await Promise.all([
          axios.get(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, headers),
          axios.get(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, headers),
        ]);

        let lineupData = lineupsRes.data.response;

        // If no lineups available, try to fetch last match lineups
        if (lineupData.length === 0) {
          const [homeLastRes, awayLastRes] = await Promise.all([
            axios.get(`https://v3.football.api-sports.io/fixtures?team=${selectedMatch.teams.home.id}&last=1`, headers),
            axios.get(`https://v3.football.api-sports.io/fixtures?team=${selectedMatch.teams.away.id}&last=1`, headers),
          ]);

          const homeLastFixtureId = homeLastRes.data.response[0]?.fixture?.id;
          const awayLastFixtureId = awayLastRes.data.response[0]?.fixture?.id;

          const [homeLineupRes, awayLineupRes] = await Promise.all([
            axios.get(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${homeLastFixtureId}`, headers),
            axios.get(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${awayLastFixtureId}`, headers),
          ]);

          lineupData = [...homeLineupRes.data.response, ...awayLineupRes.data.response];
          setUsingFallback(true);
        } else {
          setUsingFallback(false);
        }

        setLineups(lineupData);

        // Substitutions
        const allEvents = eventsRes.data.response;
        const subs = allEvents
          .filter((e) => e.type === "subst")
          .map((e) => ({
            player_in: e.assist,
            player_out: e.player,
            team: e.team,
            time: e.time.elapsed,
          }));

        setSubstitutions(subs);

        // Goal counts
        const goalMap = new Map();
        allEvents.forEach((e) => {
          if (e.type === "Goal" && e.player?.id) {
            const id = e.player.id;
            goalMap.set(id, (goalMap.get(id) || 0) + 1);
          }
        });
        setGoalScorerIds(goalMap);
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

  const homeTeam = lineups.find((team) => team.team.id === selectedMatch.teams.home.id);
  const awayTeam = lineups.find((team) => team.team.id === selectedMatch.teams.away.id);

  const homeSubs = substitutions.filter((s) => s.team.id === selectedMatch.teams.home.id);
  const awaySubs = substitutions.filter((s) => s.team.id === selectedMatch.teams.away.id);

  const getMatchStatus = () => {
    const { status, timestamp } = selectedMatch.fixture;
    switch (status.short) {
      case "NS":
        const kickoff = new Date(timestamp * 1000);
        return `Kickoff: ${kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      case "1H":
      case "2H":
      case "ET":
        return `${selectedMatch.fixture.status.elapsed}'`;
      case "HT":
        return "Half Time";
      case "FT":
        return "Full Time";
      case "PST":
        return "Postponed";
      default:
        return status.long || "Status Unavailable";
    }
  };

  return (
    <div className="Match">
      {loading ? (
        <MatchSkeleton />
      ) : (
        <>
          <div className="match-header">
            <div className="team-info">
              <Link to={`/team/${selectedMatch.teams.home.id}`}>
                <img
                  src={selectedMatch.teams.home.logo}
                  alt={selectedMatch.teams.home.name}
                  className="match-team-logo"
                />
              </Link>
              <span>{selectedMatch.teams.home.name}</span>
            </div>
            <div className="match-scores">
              {selectedMatch.goals.home} - {selectedMatch.goals.away}
            </div>
            <div className="team-info">
              <span>{selectedMatch.teams.away.name}</span>
              <Link to={`/team/${selectedMatch.teams.away.id}`}>
                <img
                  src={selectedMatch.teams.away.logo}
                  alt={selectedMatch.teams.away.name}
                  className="match-team-logo"
                />
              </Link>
            </div>
          </div>

          <div className="match-status">{getMatchStatus()}</div>

          <div className="pitch-wrapper vertical">
            {homeTeam && (
              <div className="pitch-side">
                <Lineup
                  team={homeTeam}
                  color="#03A9F4"
                  goalCounts={goalScorerIds}
                  substitutes={homeTeam.substitutes}
                  substitutions={homeSubs}
                  isFallback={usingFallback}
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
                  substitutions={awaySubs}
                  isFallback={usingFallback}
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

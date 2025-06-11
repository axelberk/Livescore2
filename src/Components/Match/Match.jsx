import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import { Skeleton, Box } from "@mui/material";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import PlayerModal from "../PlayerModal/PlayerModal";

const MatchSkeleton = () => (
  <Box padding={2}>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Skeleton variant="text" width="50%" height={30} />
    </div>
    <Skeleton variant="rectangular" height={220} sx={{ my: 2 }} />
    <Skeleton variant="rectangular" height={220} sx={{ mt: 1 }} />
  </Box>
);

const Match = () => {
  const { matchId } = useParams(); 
  const [fixture, setFixture] = useState(null);
  const [lineups, setLineups] = useState(null);
  const [goalScorerIds, setGoalScorerIds] = useState(new Map());
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  useEffect(() => {
  if (fixture && lineups) {
    const homeTeam = lineups.find(team => team.team.id === fixture.teams.home.id);
    const awayTeam = lineups.find(team => team.team.id === fixture.teams.away.id);
  }
}, [fixture, lineups]);

  useEffect(() => {
 

     const fetchFixtureAndDetails = async () => {
      try {
        const fixtureRes = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            }, params: { id: matchId } }
        );
        const match = fixtureRes.data.response[0];
        setFixture(match);

        const [lineupsRes, eventsRes] = await Promise.all([
          axios.get(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`, {headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            }, params: { fixture: matchId } }),
          axios.get(`https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,  {headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            }, params: { fixture: matchId } }),
        ]);

        setLineups(lineupsRes.data.response);
        console.log("Lineups API response:", lineupsRes.data);

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
 
console.log("Lineups from API:", lineups);
    fetchFixtureAndDetails();
  }, [matchId]);

 if (loading) return <MatchSkeleton />;
if (!fixture || !lineups) return <div>Error loading match.</div>;

  const homeTeam = lineups.find((team) => team.team.id === fixture.teams.home.id);
  const awayTeam = lineups.find((team) => team.team.id === fixture.teams.away.id);

  const homeSubs = substitutions.filter((s) => s.team.id === fixture.teams.home.id);
  const awaySubs = substitutions.filter((s) => s.team.id === fixture.teams.away.id);

  const getMatchStatus = () => {
    const { status, timestamp } = fixture.fixture;
    switch (status.short) {
      case "NS":
        const kickoff = new Date(timestamp * 1000);
        return `Kickoff: ${kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      case "1H":
      case "2H":
      case "ET":
        return `${fixture.fixture.status.elapsed}'`;
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
      <Header/>
      {loading ? (
        <MatchSkeleton />
      ) : (
        <>
        <div className="match-container">
          <div className="match-header">
            <div className="team-info">
              <Link to={`/team/${fixture.teams.home.id}`}>
                <img
                  src={fixture.teams.home.logo}
                  alt={fixture.teams.home.name}
                  className="match-team-logo"
                />
              </Link>
              <span>{fixture.teams.home.name}</span>
            </div>
            <div className="match-scores">
              {fixture.goals.home} - {fixture.goals.away}
            </div>
            <div className="team-info">
              <span>{fixture.teams.away.name}</span>
              <Link to={`/team/${fixture.teams.away.id}`}>
                <img
                  src={fixture.teams.away.logo}
                  alt={fixture.teams.away.name}
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
          <div className="subs-wrapper">
  <div className="subs-side home-subs">
    <h3>Home Substitutes</h3>
    {homeTeam?.substitutes.length > 0 ? (
      homeTeam.substitutes.map((sub) => (
        <div key={sub.player.id} className="substitute-player" >
          {sub.player.number}. {sub.player.name}
        </div>
      ))
    ) : (
      <div>No substitutes</div>
    )}
  </div>

  <div className="subs-side away-subs">
    <h3>Away Substitutes</h3>
    {awayTeam?.substitutes.length > 0 ? (
      awayTeam.substitutes.map((sub) => (
        <div key={sub.player.id} className="substitute-player">
          {sub.player.number}. {sub.player.name}
        </div>
      ))
    ) : (
      <div>No substitutes</div>
    )}
  </div>
</div>

          </div>
        </>
        
      )}
      <PlayerModal
          playerId={selectedPlayerId?.id}
          squadNumber={selectedPlayerId?.number}
          isOpen={!!selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
    </div>
    
  );
};

export default Match;

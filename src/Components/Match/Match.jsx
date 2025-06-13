import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import { Skeleton, Box } from "@mui/material";
import Header from "../Header/Header";
import PlayerModal from "../PlayerModal/PlayerModal";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import { fetchWithCache } from "../../../utils/apiCache";

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
  const [playerPhotos, setPlayerPhotos] = useState({});

  useEffect(() => {
    const fetchFixtureAndDetails = async () => {
      try {
        console.log("Fetching match data for ID:", matchId);

const fixtureRes = await fetchWithCache("https://v3.football.api-sports.io/fixtures", {
  headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY },
  params: { id: matchId },
});
        const match = fixtureRes.data.response[0];
        setFixture(match);

        const [lineupsRes, eventsRes] = await Promise.all([
          fetchWithCache(
            `https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`,
            {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
            }
          ),
          fetchWithCache(
            `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
            {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
            }
          ),
        ]);

        setLineups(lineupsRes.data.response);

        const homeTeam = lineupsRes.data.response.find(
          (team) => team.team.id === match.teams.home.id
        );
        const awayTeam = lineupsRes.data.response.find(
          (team) => team.team.id === match.teams.away.id
        );

        const allPlayers = [
          ...(homeTeam?.startXI || []).map((p) => p.player),
          ...(homeTeam?.substitutes || []).map((p) => p.player),
          ...(awayTeam?.startXI || []).map((p) => p.player),
          ...(awayTeam?.substitutes || []).map((p) => p.player),
        ];

        const fetchPlayerPhotos = async () => {
          const photos = {};
          for (const player of allPlayers) {
            try {
              const res = await fetchWithCache(
                "https://v3.football.api-sports.io/players",
                {
                  headers: {
                    "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
                  },
                  params: {
                    id: player.id,
                    season: "2024",
                  },
                }
              );
              const data = res.data.response[0]?.player?.photo;
              if (data) {
                photos[player.id] = data;
              }
            } catch (e) {
              console.warn("Photo not found for player", player.name);
            }
          }
          setPlayerPhotos(photos);
        };

        await fetchPlayerPhotos();

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

    fetchFixtureAndDetails();
  }, [matchId]);

  if (loading) return <MatchSkeleton />;
  if (!fixture) return <div>Error loading match data.</div>;
  if (!lineups || lineups.length === 0)
    return (
      <div className="Match">
        <Header />
        <div>No lineups available for this match.</div>
      </div>
    );

  const homeTeam = lineups.find((team) => team.team.id === fixture.teams.home.id);
  const awayTeam = lineups.find((team) => team.team.id === fixture.teams.away.id);

  const homeSubs = substitutions.filter((s) => s.team.id === fixture.teams.home.id);
  const awaySubs = substitutions.filter((s) => s.team.id === fixture.teams.away.id);

  const subbedOnIds = new Set(
    substitutions.map((s) => s.player_in?.id).filter(Boolean)
  );

  const getMatchStatus = () => {
    const { status, timestamp } = fixture.fixture;
    switch (status.short) {
      case "NS":
        const kickoff = new Date(timestamp * 1000);
        return `Kickoff: ${kickoff.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
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
      <Header />
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
          {homeTeam ? (
            <div className="pitch-side">
              <Lineup
                team={homeTeam}
                color="#03A9F4"
                goalCounts={goalScorerIds}
                substitutions={homeSubs}
                isFallback={usingFallback}
                playerPhotos={playerPhotos}
              />
            </div>
          ) : (
            <div>Home team lineup not available</div>
          )}

          {/* <div className="pitch-divider horizontal">
            <div className="center-circle horizontal-circle"></div>
          </div> */}

          {awayTeam ? (
            <div className="pitch-side">
              <Lineup
                team={awayTeam}
                color="#F44336"
                isAway
                goalCounts={goalScorerIds}
                substitutions={awaySubs}
                isFallback={usingFallback}
                playerPhotos={playerPhotos}
              />
            </div>
          ) : (
            <div>Away team lineup not available</div>
          )}
        </div>

        {homeTeam?.substitutes && awayTeam?.substitutes && (
          <div className="subs-wrapper">
            <div className="subs-side home-subs">
              <h3>Home Substitutes</h3>
              {homeTeam.substitutes.map((sub) => {
                const isGoalscorer = goalScorerIds.has(sub.player.id);
                const wasSubbedOn = subbedOnIds.has(sub.player.id);
                return (
                  <div
                    key={sub.player.id}
                    className="substitute-player"
                    onClick={() =>
                      setSelectedPlayerId({
                        id: sub.player.id,
                        number: sub.player.number,
                      })
                    }
                  >
                    {playerPhotos[sub.player.id] && (
                      <img
                        src={playerPhotos[sub.player.id]}
                        alt={sub.player.name}
                        className="player-photo-sub"
                      />
                    )}
                    <div className="sub-text">
                      {sub.player.number}. {sub.player.name}
                      {wasSubbedOn && (
                        <LoopIcon fontSize="small" style={{ height: "14px", marginLeft: 4 }} />
                      )}
                      {isGoalscorer && (
                        <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 4 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="subs-side away-subs">
              <h3>Away Substitutes</h3>
              {awayTeam.substitutes.map((sub) => {
                const isGoalscorer = goalScorerIds.has(sub.player.id);
                const wasSubbedOn = subbedOnIds.has(sub.player.id);
                return (
                  <div
                    key={sub.player.id}
                    className="substitute-player"
                    onClick={() =>
                      setSelectedPlayerId({
                        id: sub.player.id,
                        number: sub.player.number,
                      })
                    }
                  >
                    {playerPhotos[sub.player.id] && (
                      <img
                        src={playerPhotos[sub.player.id]}
                        alt={sub.player.name}
                        className="player-photo-sub"
                      />
                    )}
                    <div className="sub-text">
                      {sub.player.number}. {sub.player.name}
                      {wasSubbedOn && (
                        <LoopIcon fontSize="small" style={{ height: "14px", marginLeft: 2 }} />
                      )}
                      {isGoalscorer && (
                        <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 0 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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

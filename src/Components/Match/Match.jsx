
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import Header from "../Header/Header";
import PlayerModal from "../PlayerModal/PlayerModal";
import { fetchWithCache } from "../../../utils/apiCache";
import { Skeleton, Box } from "@mui/material";
import StadiumIcon from '@mui/icons-material/Stadium';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

const MatchSkeleton = () => (
  <div>
    <Header/>
    <Box padding={0} display={"flex"} flexDirection="column" alignItems="center">
    <Skeleton variant="text" width="40%" height={50} />
    <Skeleton variant="rectangular" height={200} width={600} sx={{ my: 1 }} />
    <Skeleton variant="rectangular" height={200}  width={600} sx={{my: 2}} />
    <div className="subs-skeleton">
    <Skeleton variant="rectangular" height={200} width={250} />
    <Skeleton variant="rectangular" height={200} width={250} />
    </div>
  </Box>
  </div>
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
  const [goalEvents, setGoalEvents] = useState([]);
  const [redCards, setRedCards] = useState([]);


  useEffect(() => {
    const fetchFixtureAndDetails = async () => {
      try {
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

        const goalEvents = allEvents
  .filter((e) => e.type === "Goal")
  .sort((a, b) => a.time.elapsed - b.time.elapsed);

  const redCardEvents = allEvents
  .filter((e) => e.detail === "Red Card")
  .sort((a, b) => a.time.elapsed - b.time.elapsed);

setGoalEvents(goalEvents);
setRedCards(redCardEvents);


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

//   const usedHomeSubs = homeTeam.substitutes.filter((sub) =>
//   subbedOnIds.has(sub.player.id)
// );
// const unusedHomeSubs = homeTeam.substitutes.filter(
//   (sub) => !subbedOnIds.has(sub.player.id)
// );

// const usedAwaySubs = awayTeam.substitutes.filter((sub) =>
//   subbedOnIds.has(sub.player.id)
// );
// const unusedAwaySubs = awayTeam.substitutes.filter(
//   (sub) => !subbedOnIds.has(sub.player.id)
// );


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

  const getSubInfo = (playerId) => {
  return substitutions.find((s) => s.player_in?.id === playerId);
};

  const renderSub = (sub) => {
  const isGoalscorer = goalScorerIds.has(sub.player.id);
  const wasSubbedOn = subbedOnIds.has(sub.player.id);
  const subInfo = getSubInfo(sub.player.id);

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
      <div className="player-photo-wrapper">
        {playerPhotos[sub.player.id] && (
          <img
            src={playerPhotos[sub.player.id]}
            alt={sub.player.name}
            className="player-photo-positioned"
          />
        )}
        {wasSubbedOn && (
          <div className="sub-icon-wrapper">
            <LoopIcon fontSize="small" className="sub-on-icon" />
          </div>
        )}
        {isGoalscorer && (
          <div className="goal-icon-wrapper">
            <SportsSoccerIcon fontSize="small" className="goal-icon" />
          </div>
        )}
      </div>

     <div className="sub-text">
        {sub.player.number}. {sub.player.name}
      </div>
        {subInfo?.player_out?.name && (
          <small style={{ color: "#666", display: "block" }}>
             {subInfo?.time ? `${subInfo.time}' ` : ""}
            ({subInfo.player_out.name})
          </small>
        )}
    </div>
  );
};

const timelineEvents = [...goalEvents, ...redCards].sort(
  (a, b) => a.time.elapsed - b.time.elapsed
);

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
    <div className="match-goalscorers">
 <div className="goal-timeline">
  {timelineEvents.map((event, idx) => {
    const isHome = event.team.id === fixture.teams.home.id;
    const isGoal = event.type === "Goal";
    const isRedCard = event.detail === "Red Card";

    return (
      <div key={idx} className="goal-item">
        {isHome ? (
          <>
            <div className="goal-left">
              <span className="goal-minute">{event.time.elapsed}'</span>
              <span
                className={`goal-player ${isRedCard ? "red-card-player" : ""}`}
                onClick={() =>
                  setSelectedPlayerId({
                    id: event.player.id,
                    number: null,
                  })
                }
              >
                {event.player.name}
                
              </span>
              
            </div>
               {isGoal && <span className="goal-icon"><SportsSoccerIcon></SportsSoccerIcon></span>}

            {isRedCard && <img src="/Red_card.svg" alt="" className="individual-logo" />}
            <div className="goal-right" />
          </>
        ) : (
          <>
            <div className="goal-left" />
            {isRedCard && <img src="/Red_card.svg" alt="" className="individual-logo" />}
             {isGoal && <span className="goal-icon"><SportsSoccerIcon></SportsSoccerIcon></span>}
            <div className="goal-right">
              <span
                className={`goal-player ${isRedCard ? "red-card-player" : ""}`}
                onClick={() =>
                  setSelectedPlayerId({
                    id: event.player.id,
                    number: null,
                  })
                }
              >
                {event.player.name}
               
                
              </span>
              <span className="goal-minute">{event.time.elapsed}'</span>
              
            </div>
          </>
        )}
      </div>
    );
  })}
</div>


</div>
<div className="match-stadium">
  <PlaceOutlinedIcon  />{fixture?.fixture?.venue?.name || "Stadium info unavailable"}{fixture?.fixture?.venue?.city ? `, ${fixture.fixture.venue.city}` : ""}
</div>  
<div className="match-referee">
  Referee: {fixture?.fixture?.referee || "Referee info unavailable"}
</div>
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

          <div className="pitch-divider horizontal">
            <div className="center-circle horizontal-circle"></div>
          </div>

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
   
      <h4>Used Substitutes</h4>
      <div className="used-subs">
        <div className="used-subs-home">
{homeTeam.substitutes
        .filter((sub) => subbedOnIds.has(sub.player.id))
        .map(renderSub)}
        </div>
        <div className="used-subs-away">
 {awayTeam.substitutes
        .filter((sub) => subbedOnIds.has(sub.player.id))
        .map(renderSub)}
        </div>
      </div>
      
      <h4>Unused Substitutes</h4>
      <div className="unused-subs">
        <div className="unused-subs-home">
      {homeTeam.substitutes
        .filter((sub) => !subbedOnIds.has(sub.player.id))
        .map(renderSub)}
        </div>
        <div className="unused-subs-away">
         {awayTeam.substitutes
        .filter((sub) => !subbedOnIds.has(sub.player.id))
        .map(renderSub)}
        </div>
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

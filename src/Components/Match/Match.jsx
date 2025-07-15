import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Match.css";
import Lineup from "../Lineup/Lineup";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import Header from "../Header/Header";
import PlayerModal from "../PlayerModal/PlayerModal";
import { fetchWithCache } from "../../../utils/apiCache";
import { Skeleton, Box, useMediaQuery } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SportsTwoToneIcon from "@mui/icons-material/SportsTwoTone";

const MatchSkeleton = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const mainWidth = isSmallScreen ? "90%" : 600;
  const subsWidth = isSmallScreen ? "45%" : 250;
  const fontSize = isSmallScreen ? 30 : 50;

  return (
    <div>
      <Header />
      <Box
        padding={0}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Skeleton variant="text" width="40%" height={fontSize} />
        <Skeleton
          variant="rectangular"
          height={200}
          width={mainWidth}
          sx={{ my: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={200}
          width={mainWidth}
          sx={{ my: 1 }}
        />
        <Box className="subs-skeleton" display="flex" gap={2}>
          <Skeleton variant="rectangular" height={200} width={subsWidth} />
          <Skeleton variant="rectangular" height={200} width={subsWidth} />
        </Box>
      </Box>
    </div>
  );
};

const fetchPhotosForLineups = async (lineupsArray, setPlayerPhotos) => {
  const allPlayers = lineupsArray.flatMap((lineup) => [
    ...(lineup.startXI || []).map((p) => p.player),
    ...(lineup.substitutes || []).map((p) => p.player),
  ]);
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
      const data = res.response[0]?.player?.photo;
      if (data) {
        photos[player.id] = data;
      }
    } catch (e) {
      console.warn("Photo not found for player", player.name, e);
    }
  }
  setPlayerPhotos(photos);
};

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

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const weekday = date.toLocaleString("en-GB", { weekday: "long" });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n) => {
      if (n > 3 && n < 21) return `${n}th`;
      switch (n % 10) {
        case 1:
          return `${n}st`;
        case 2:
          return `${n}nd`;
        case 3:
          return `${n}rd`;
        default:
          return `${n}th`;
      }
    };

    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${weekday} ${getOrdinalSuffix(day)} ${month} ${year} - ${time}`;
  };

  useEffect(() => {
    const fetchFixtureAndDetails = async () => {
      try {
        const fixtureRes = await fetchWithCache(
          "https://v3.football.api-sports.io/fixtures",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: { id: matchId },
          }
        );
        if (!fixtureRes?.response?.[0]) {
          throw new Error("No fixture data found in response");
        }
        const match = fixtureRes.response[0];
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

        let lineupsData = [];
        if (!lineupsRes.response || lineupsRes.response.length === 0) {
          setUsingFallback(true);

          const getLastLineup = async (teamId) => {
            try {
              const teamFixturesRes = await fetchWithCache(
                `https://v3.football.api-sports.io/fixtures`,
                {
                  headers: {
                    "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
                  },
                  params: {
                    team: teamId,
                    season: "2025",
                    status: "FT",
                    last: 10,
                  },
                }
              );

              for (const fixture of teamFixturesRes.response) {
                const lineupRes = await fetchWithCache(
                  `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture.fixture.id}`,
                  {
                    headers: {
                      "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
                    },
                  }
                );

                const teamLineup = lineupRes.response?.find(
                  (entry) => entry.team.id === teamId
                );

                if (teamLineup) return teamLineup;
              }
            } catch (err) {
              console.warn("Error getting last lineup for team", teamId, err);
            }

            return null;
          };

          const [fallbackHome, fallbackAway] = await Promise.all([
            getLastLineup(match.teams.home.id),
            getLastLineup(match.teams.away.id),
          ]);

          if (fallbackHome) lineupsData.push(fallbackHome);
          if (fallbackAway) lineupsData.push(fallbackAway);
        } else {
          setUsingFallback(false);
          lineupsData = lineupsRes.response;
        }

        setLineups(lineupsData);

        await fetchPhotosForLineups(lineupsData, setPlayerPhotos);

        const allEvents = eventsRes.response;

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
          .map((e) => {
            const assistIsSubstitute = lineupsData.some((team) =>
              team.substitutes.some((sub) => sub.player.id === e.assist?.id)
            );

            if (assistIsSubstitute) {
              return {
                player_in: e.assist,
                player_out: e.player,
                team: e.team,
                time: e.time.elapsed,
              };
            } else {
              return {
                player_in: e.player,
                player_out: e.assist,
                team: e.team,
                time: e.time.elapsed,
              };
            }
          });

        setSubstitutions(subs);

        const goalMap = new Map();
        allEvents.forEach((e) => {
          if (e.type === "Goal" && e.player?.id) {
            const id = e.player.id;
            const isOwnGoal = e.detail === "Own Goal";

            if (!goalMap.has(id)) {
              goalMap.set(id, { goals: 0, ownGoals: 0 });
            }

            const entry = goalMap.get(id);
            if (isOwnGoal) {
              entry.ownGoals += 1;
            } else {
              entry.goals += 1;
            }
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

  //   useEffect(() => {
  //   let intervalId;

  //   const fetchFixtureAndDetails = async () => {
  //     try {
  //       const fixtureRes = await fetchWithCache(
  //         "https://v3.football.api-sports.io/fixtures",
  //         {
  //           headers: {
  //             "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
  //           },
  //           params: { id: matchId },
  //         }
  //       );
  //       if (!fixtureRes?.response?.[0]) throw new Error("No fixture data found");

  //       const match = fixtureRes.response[0];
  //       setFixture(match);

  //       const [lineupsRes, eventsRes] = await Promise.all([
  //         fetchWithCache(
  //           `https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`,
  //           { headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY } }
  //         ),
  //         fetchWithCache(
  //           `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
  //           { headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY } }
  //         )
  //       ]);

  //       let lineupsData = [];

  //       if (!lineupsRes.response || lineupsRes.response.length === 0) {
  //         setUsingFallback(true);

  //         const getLastLineup = async (teamId) => {
  //           try {
  //             const teamFixturesRes = await fetchWithCache(
  //               `https://v3.football.api-sports.io/fixtures`,
  //               {
  //                 headers: {
  //                   "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
  //                 },
  //                 params: { team: teamId, season: "2025", status: "FT", last: 10 },
  //               }
  //             );

  //             for (const fixture of teamFixturesRes.response) {
  //               const lineupRes = await fetchWithCache(
  //                 `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture.fixture.id}`,
  //                 { headers: { "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY } }
  //               );
  //               const teamLineup = lineupRes.response?.find(
  //                 (entry) => entry.team.id === teamId
  //               );
  //               if (teamLineup) return teamLineup;
  //             }
  //           } catch (err) {
  //             console.warn("Error getting last lineup for team", teamId, err);
  //           }
  //           return null;
  //         };

  //         const [fallbackHome, fallbackAway] = await Promise.all([
  //           getLastLineup(match.teams.home.id),
  //           getLastLineup(match.teams.away.id)
  //         ]);

  //         if (fallbackHome) lineupsData.push(fallbackHome);
  //         if (fallbackAway) lineupsData.push(fallbackAway);
  //       } else {
  //         setUsingFallback(false);
  //         lineupsData = lineupsRes.response;
  //       }

  //       setLineups(lineupsData);
  //       await fetchPhotosForLineups(lineupsData, setPlayerPhotos);

  //       const allEvents = eventsRes.response;

  //       const goalEvents = allEvents
  //         .filter((e) => e.type === "Goal")
  //         .sort((a, b) => a.time.elapsed - b.time.elapsed);

  //       const redCardEvents = allEvents
  //         .filter((e) => e.detail === "Red Card")
  //         .sort((a, b) => a.time.elapsed - b.time.elapsed);

  //       setGoalEvents(goalEvents);
  //       setRedCards(redCardEvents);

  //       const subs = allEvents
  //         .filter((e) => e.type === "subst")
  //         .map((e) => {
  //           const assistIsSub = lineupsData.some((team) =>
  //             team.substitutes.some((sub) => sub.player.id === e.assist?.id)
  //           );
  //           return {
  //             player_in: assistIsSub ? e.assist : e.player,
  //             player_out: assistIsSub ? e.player : e.assist,
  //             team: e.team,
  //             time: e.time.elapsed,
  //           };
  //         });

  //       setSubstitutions(subs);

  //       const goalMap = new Map();
  //       allEvents.forEach((e) => {
  //         if (e.type === "Goal" && e.player?.id) {
  //           const id = e.player.id;
  //           const isOwnGoal = e.detail === "Own Goal";
  //           if (!goalMap.has(id)) {
  //             goalMap.set(id, { goals: 0, ownGoals: 0 });
  //           }
  //           const entry = goalMap.get(id);
  //           if (isOwnGoal) {
  //             entry.ownGoals += 1;
  //           } else {
  //             entry.goals += 1;
  //           }
  //         }
  //       });
  //       setGoalScorerIds(goalMap);
  //     } catch (err) {
  //       console.error("Error fetching match data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFixtureAndDetails(); // run immediately

  //   // ✅ Start polling every 30s
  //   intervalId = setInterval(fetchFixtureAndDetails, 30000);

  //   return () => clearInterval(intervalId); // cleanup
  // }, [matchId]);

  if (loading) return <MatchSkeleton />;
  if (!fixture)
    return (
      <div>
        <Header />
        Error loading match data.
      </div>
    );
  if (!lineups || lineups.length === 0)
    return (
      <div className="Match">
        <Header />
        <div>No lineups available for this match.</div>
      </div>
    );

  const homeTeam = lineups.find(
    (team) => team.team.id === fixture.teams.home.id
  );
  const awayTeam = lineups.find(
    (team) => team.team.id === fixture.teams.away.id
  );

  const homeSubs = substitutions.filter(
    (s) => s.team.id === fixture.teams.home.id
  );
  const awaySubs = substitutions.filter(
    (s) => s.team.id === fixture.teams.away.id
  );

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

  const getSubInfo = (playerId) =>
    substitutions.find((s) => s.player_in?.id === playerId);

  const renderSub = (sub) => {
    const isGoalscorer = goalScorerIds.has(sub.player.id);
    const wasSubbedOn = subbedOnIds.has(sub.player.id);
    const subInfo = getSubInfo(sub.player.id);
    const hasRedCard = redCards.some((rc) => rc.player?.id === sub.player.id);

    return (
      <div
        key={sub.player.id}
        className="substitute-player"
        onClick={() => {
          setSelectedPlayerId({ id: sub.player.id, number: sub.player.number });
        }}
      >
        <div className="player-photo-wrapper">
          <img
            src={playerPhotos[sub.player.id] || "/placeholder-player.png"}
            alt={sub.player.name}
            className="player-photo-positioned"
            loading="lazy"
          />
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
          {hasRedCard && (
            <img
              src="/Red_card.svg"
              alt="Red Card"
              className="individual-logo red-card-sub-icon"
              loading="lazy"
            />
          )}
        </div>

        <div className="sub-text">
          <span className="player-numbered-name">
            {sub.player.number}.{" "}
            <span className="full-name">{sub.player.name}</span>
            <span className="last-name-only">
              {sub.player.name.split(" ").slice(-1).join(" ")}
            </span>
          </span>
        </div>
        {subInfo?.player_out?.name && (
          <small className="sub-out-player">
            {subInfo?.time ? `${subInfo.time}' ` : ""}(
            <span className="full-name">{subInfo.player_out.name}</span>
            <span className="last-name-only">
              {subInfo.player_out.name.split(" ").slice(-1).join(" ")}
            </span>
            )
          </small>
        )}
      </div>
    );
  };

  const timelineEvents = [...goalEvents, ...redCards].sort(
    (a, b) => a.time.elapsed - b.time.elapsed
  );

  const formatRound = (roundString) => {
    if (!roundString) return "";

    // Try to match a number at the end of the string
    const match = roundString.match(/^(.*?)(\s*-\s*)(\d+)$/);
    if (match) {
      const [, prefix, separator, number] = match;
      return `${prefix}${separator}Matchday ${number}`;
    }

    return roundString;
  };

  return (
    <div className="Match">
      <Header />

      <div className="match-container">
        <div className="match-league">
          <img
            src={fixture.league.logo}
            alt={fixture.league.name}
            className="match-league-logo"
            loading="lazy"
          />
          <div className="match-league-info">
            <span>
              <Link
                to={`/league/${fixture.league.id}`}
                className="match-league-link"
              >
                {fixture.league.name}
              </Link>{" "}
              - {formatRound(fixture.league.round)}
            </span>
            <div className="match-date-time">
              <br />
              <span className="match-time">
                {formatMatchDate(fixture.fixture.date)}
              </span>
            </div>
          </div>
        </div>
        <div className="match-header">
          <div className="team-info team-info-home">
            <Link
              className="match-team-link"
              to={`/team/${fixture.teams.home.id}`}
            >
              <img
                src={fixture.teams.home.logo}
                alt={fixture.teams.home.name}
                className="match-team-logo"
                loading="lazy"
              />
              <span>{fixture.teams.home.name}</span>
            </Link>
          </div>

          <div className="match-score-status">
            <div className="match-scores">
              {fixture.goals.home} - {fixture.goals.away}
            </div>
          </div>

          <div className="team-info team-info-away">
            <Link
              className="match-team-link"
              to={`/team/${fixture.teams.away.id}`}
            >
              <span>{fixture.teams.away.name}</span>

              <img
                src={fixture.teams.away.logo}
                alt={fixture.teams.away.name}
                className="match-team-logo"
                loading="lazy"
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
              const isOwnGoal = event.detail === "Own Goal";
              const isRedCard = event.detail === "Red Card";

              return (
                <div key={idx} className="goal-item">
                  {isHome ? (
                    <>
                      <div className="goal-left">
                        <span className="goal-minute">
                          {event.time.elapsed}'
                        </span>
                        <span
                          className={`goal-player ${
                            isRedCard ? "red-card-player" : ""
                          }`}
                          onClick={() => {
                            setSelectedPlayerId({
                              id: event.player.id,
                              number: null,
                            });
                          }}
                        >
                          {event.player.name}
                          {isOwnGoal ? " (OG)" : ""}
                        </span>
                      </div>
                      {isGoal && (
                        <span className="goal-icon">
                          <SportsSoccerIcon fontSize="small"></SportsSoccerIcon>
                        </span>
                      )}

                      {isRedCard && (
                        <img
                          src="/Red_card.svg"
                          alt=""
                          className="individual-logo"
                          loading="lazy"
                        />
                      )}
                      <div className="goal-right" />
                    </>
                  ) : (
                    <>
                      <div className="goal-left" />
                      {isRedCard && (
                        <img
                          src="/Red_card.svg"
                          alt=""
                          className="individual-logo"
                          loading="lazy"
                        />
                      )}
                      {isGoal && (
                        <span className="goal-icon">
                          <SportsSoccerIcon fontSize="small"></SportsSoccerIcon>
                        </span>
                      )}
                      <div className="goal-right">
                        <span
                          className={`goal-player ${
                            isRedCard ? "red-card-player" : ""
                          }`}
                          onClick={() => {
                            setSelectedPlayerId({
                              id: event.player.id,
                              number: null,
                            });
                          }}
                        >
                          {event.player.name}
                          {isOwnGoal ? " (OG)" : ""}
                        </span>
                        <span className="goal-minute">
                          {event.time.elapsed}'
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="stadium-referee">
          <div className="match-stadium" title="Location">
            <PlaceOutlinedIcon />
            {fixture?.fixture?.venue?.name || "Stadium info unavailable"}
            {fixture?.fixture?.venue?.city
              ? `, ${fixture.fixture.venue.city}`
              : ""}
          </div>
          <div className="match-referee" title="Referee">
            <SportsTwoToneIcon title="Referee" />{" "}
            {fixture?.fixture?.referee || "Referee info unavailable"}
          </div>
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
                redCards={redCards}
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
                redCards={redCards}
              />
            </div>
          ) : (
            <div>Away team lineup not available</div>
          )}
        </div>

        {!usingFallback && homeTeam?.substitutes && awayTeam?.substitutes && (
          <div className="subs-wrapper">
            <h4>Used Substitutes</h4>
            <div className="used-subs">
              <div className="used-subs-home">
                {homeTeam.substitutes.filter((sub) =>
                  subbedOnIds.has(sub.player.id)
                ).length > 0 ? (
                  homeTeam.substitutes
                    .filter((sub) => subbedOnIds.has(sub.player.id))
                    .map(renderSub)
                ) : (
                  <div className="substitute-placeholder" />
                )}
              </div>
              <hr />
              <div className="used-subs-away">
                {awayTeam.substitutes.filter((sub) =>
                  subbedOnIds.has(sub.player.id)
                ).length > 0 ? (
                  awayTeam.substitutes
                    .filter((sub) => subbedOnIds.has(sub.player.id))
                    .map(renderSub)
                ) : (
                  <div className="substitute-placeholder" />
                )}
              </div>
            </div>

            <h4>Unused Substitutes</h4>
            <div className="unused-subs">
              <div className="unused-subs-home">
                {homeTeam.substitutes
                  .filter((sub) => !subbedOnIds.has(sub.player.id))
                  .map((sub) => (
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
                        <img
                          src={
                            playerPhotos[sub.player.id] ||
                            "/placeholder-player.png"
                          }
                          alt={sub.player.name}
                          className="player-photo-positioned"
                          loading="lazy"
                        />
                      </div>
                      <div className="sub-text">
                        <span className="player-numbered-name">
                          {sub.player.number}.{" "}
                          <span className="full-name">{sub.player.name}</span>
                          <span className="last-name-only">
                            {sub.player.name.split(" ").slice(-1).join(" ")}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <hr />
              <div className="unused-subs-away">
                {awayTeam.substitutes
                  .filter((sub) => !subbedOnIds.has(sub.player.id))
                  .map((sub) => (
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
                        <img
                          src={
                            playerPhotos[sub.player.id] ||
                            "/placeholder-player.png"
                          }
                          alt={sub.player.name}
                          className="player-photo-positioned"
                          loading="lazy"
                        />
                      </div>
                      <div className="sub-text">
                        <span className="player-numbered-name">
                          {sub.player.number}.{" "}
                          <span className="full-name">{sub.player.name}</span>
                          <span className="last-name-only">
                            {sub.player.name.split(" ").slice(-1).join(" ")}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedPlayerId && (
          <>
            <PlayerModal
              playerId={selectedPlayerId.id}
              squadNumber={selectedPlayerId.number}
              isOpen={true}
              onClose={() => setSelectedPlayerId(null)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Match;

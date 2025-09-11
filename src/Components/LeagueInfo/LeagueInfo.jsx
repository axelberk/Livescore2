import "./LeagueInfo.css";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import TeamInfo from "../TeamInfo/TeamInfo";
import { Link } from "react-router-dom";
import PlayerModal from "../PlayerModal/PlayerModal";
import groupTwoLeggedTies from "../../../utils/twoLegs";
import { motion } from "motion/react";
import { useLeagueData } from "../../../utils/useLeagueData";

const LeagueInfo = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [seasonYear, setSeasonYear] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [topAssists, setTopAssists] = useState([]);
  const [redCards, setRedCards] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [viewMode, setViewMode] = useState("bracket");
  const [bracketData, setBracketData] = useState([]);
  const [qualificationFixtures, setQualificationFixtures] = useState([]);

  const getDisplayScore = (match) => {
    const { fulltime, extratime, penalty } = match.score;

    const ftHome = fulltime?.home ?? 0;
    const ftAway = fulltime?.away ?? 0;

    const etHome = extratime?.home ?? 0;
    const etAway = extratime?.away ?? 0;

    const penHome = penalty?.home;
    const penAway = penalty?.away;

    if (penHome !== null && penAway !== null) {
      return { home: penHome, away: penAway, type: "PEN" };
    }

    if (extratime && (etHome > 0 || etAway > 0)) {
      return {
        home: ftHome + etHome,
        away: ftAway + etAway,
        type: "AET",
      };
    }

    if (fulltime.home !== null && fulltime.away !== null) {
      return { home: ftHome, away: ftAway, type: "FT" };
    }

    return { home: "-", away: "-", type: "FT" };
  };

  const hasQualification =
    viewMode === "qualification" || qualificationFixtures.length > 0;
  const hasBracket = bracketData.length > 0;

  const handlePlayerClick = (player) => {
    setSelectedPlayerId(player);
  };

  const getDescriptionColor = (description) => {
    if (!description) return "inherit";

    if (description.includes("Champions League")) return "#4CAF50";
    if (description.includes("Europa League")) return "#6495ED";
    if (description.includes("Conference League")) return "#F0E68C";
    if (description.includes("Relegation")) return "#F44336";
    if (description.includes("Promotion")) return "#FF9800";
    return "#E0E0E0";
  };

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const res = await axios.get(
          "https://v3.football.api-sports.io/leagues",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: { id: leagueId },
          }
        );

        const leagueData = res.data.response[0];
        setLeague(leagueData);

        const currentSeasonObj = leagueData.seasons.find(
          (season) => season.current
        );
        setCurrentSeason(currentSeasonObj);
        setSeasonYear(currentSeasonObj?.year);
      } catch (err) {
        console.error("Failed to fetch league info:", err);
      }
    };

    fetchLeague();
  }, [leagueId]);

  useEffect(() => {
    if (!seasonYear) return;

    const fetchFixtures = async () => {
      try {
        const res = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              league: leagueId,
              season: seasonYear,
            },
          }
        );

        const knockoutMatches = res.data.response.filter(
          (fixture) =>
            (fixture.league.round &&
              fixture.league.round.toLowerCase().includes("round")) ||
            fixture.league.round.toLowerCase().includes("final")
        );

        setBracketData(knockoutMatches);
      } catch (err) {
        console.error("Failed to fetch fixtures for bracket", err);
      }
    };

    fetchFixtures();
  }, [seasonYear, leagueId]);

  useEffect(() => {
    if (!seasonYear) return;

    const fetchDetails = async () => {
      try {
        const [standingsRes, scorersRes, assistsRes, redCardsRes] =
          await Promise.all([
            axios.get("https://v3.football.api-sports.io/standings", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topscorers", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topassists", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topredcards", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { league: leagueId, season: seasonYear },
            }),
          ]);

        setStandings(standingsRes.data.response[0]?.league?.standings || []);
        setTopScorers(scorersRes.data.response || []);
        setTopAssists(assistsRes.data.response || []);
        setRedCards(redCardsRes.data.response || []);
      } catch (err) {
        console.error("Failed to fetch standings or top scorers:", err);
      }
    };

    fetchDetails();
  }, [seasonYear, leagueId]);

  useEffect(() => {
    if (!seasonYear) return;

    const fetchQualificationRounds = async () => {
      try {
        const res = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              league: leagueId,
              season: seasonYear,
            },
          }
        );

        const fixtures = res.data.response;

        const qualification = fixtures.filter((fixture) => {
          const round = fixture.league.round?.toLowerCase() || "";
          return (
            (round.includes("qualifying") || round.includes("play-off")) &&
            !round.includes("knockout")
          );
        });

        setQualificationFixtures(qualification);
      } catch (err) {
        console.error("Failed to fetch qualification rounds:", err);
      }
    };

    fetchQualificationRounds();
  }, [seasonYear, leagueId]);

  useEffect(() => {
    if (
      viewMode === "qualification" &&
      seasonYear &&
      qualificationFixtures.length === 0
    ) {
      setViewMode("standings");
    }

    if (viewMode === "bracket" && seasonYear && bracketData.length === 0) {
      setViewMode("standings");
    }
  }, [viewMode, qualificationFixtures, bracketData, seasonYear]);

  const hasLeagueEnded = () => {
    if (!league || !league.seasons) return false;

    const season = league.seasons.find((s) => s.year === seasonYear);
    if (!season?.end) return false;

    return new Date(season.end) < new Date();
  };

  const formatSeasonLabel = (season) => {
    if (!season?.start || !season?.end) return season?.year ?? "";

    const startYear = new Date(season.start).getFullYear();
    const endYear = new Date(season.end).getFullYear();

    if (startYear === endYear) return `${startYear}`;

    const endYY = String(endYear).slice(-2);
    return `${startYear}-${endYY}`;
  };

  const seasonLabel = formatSeasonLabel(currentSeason);

  if (!league)
    return (
      <div>
        <Header></Header>Loading league info...
      </div>
    );

  const groupFixturesByRound = (fixtures) => {
    const grouped = {};
    fixtures.forEach((match) => {
      const round = match.league.round || "Unknown Round";
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(match);
    });
    return grouped;
  };

  const renderQualificationBracket = () => {
    if (qualificationFixtures.length === 0)
      return <p>No qualification fixtures available.</p>;

    const grouped = groupFixturesByRound(qualificationFixtures);

    const ties = groupTwoLeggedTies(
      bracketData.filter(
        (match) => !match.league.round?.toLowerCase().includes("qualifying")
      )
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="qualification-bracket"
      >
        <div className="bracket-rows">
          {Object.entries(grouped).map(([round, matches]) => {
            const tiesMap = new Map();

            matches.forEach((match) => {
              const homeId = match.teams.home.id;
              const awayId = match.teams.away.id;
              const key = `${Math.min(homeId, awayId)}-${Math.max(
                homeId,
                awayId
              )}`;

              if (!tiesMap.has(key)) {
                tiesMap.set(key, {
                  fixtures: [],
                  homeTeam: match.teams.home,
                  awayTeam: match.teams.away,
                  round: match.league.round,
                });
              }
              tiesMap.get(key).fixtures.push(match);
            });

            const ties = Array.from(tiesMap.values());

            return (
              <div key={round} className="bracket-round-group">
                <hr />
                <h3 className="bracket-round-title">{round}</h3>
                <div className="bracket-row">
                  {ties.map(({ fixtures, homeTeam, awayTeam }) => {
                    const aggregate = fixtures.reduce(
                      (acc, match) => {
                        const { home, away } = match.teams;
                        const goals = match.goals;

                        if (home.id === homeTeam.id) {
                          acc.home += goals.home;
                          acc.away += goals.away;
                        } else if (away.id === homeTeam.id) {
                          acc.home += goals.away;
                          acc.away += goals.home;
                        }

                        return acc;
                      },
                      { home: 0, away: 0 }
                    );

                    const isTwoLeggedTie = fixtures.length === 2;

                    return (
                      <div
                        key={homeTeam.id + "-" + awayTeam.id + round}
                        className="bracket-match-card"
                      >
                        <p className="bracket-aggregate">
                          {homeTeam.name}
                          {/*  <br /> - <br /> */} - {awayTeam.name}
                          {isTwoLeggedTie && (
                            <span className="aggregate-score">
                              {" "}
                              ({aggregate.home}–{aggregate.away} agg.)
                            </span>
                          )}
                        </p>

                        {fixtures.map((match) => {
                          const displayScore = getDisplayScore(match);
                          const date = new Date(
                            match.fixture.date
                          ).toLocaleDateString();
                          const { home, away } = match.teams;

                          return (
                            <Link
                              key={match.fixture.id}
                              to={`/match/${match.fixture.id}`}
                              className="bracket-match-link"
                            >
                              <div className="bracket-match">
                                <p className="bracket-date">{date}</p>
                                <div className="bracket-team">
                                  <img
                                    className="bracket-logo"
                                    src={home.logo}
                                    alt={home.name}
                                  />
                                  <span>{home.name}</span>
                                  <strong>{displayScore.home}</strong>
                                </div>
                                <div className="bracket-team">
                                  <img
                                    className="bracket-logo"
                                    src={away.logo}
                                    alt={away.name}
                                  />
                                  <span>{away.name}</span>
                                  <strong>{displayScore.away}</strong>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="league-info">
      <Header />
      <div className="leagueinfo-header">
        <img
          src={league.league.logo}
          alt="League logo"
          style={{ height: 40 }}
        />
        <h2>
          {league.league.name} {seasonLabel}
        </h2>
      </div>

      <hr className="solid"></hr>
      <div className="view-switch">
        {hasQualification && (
          <button
            className={viewMode === "qualification" ? "active" : ""}
            onClick={() => setViewMode("qualification")}
          >
            Qualification
          </button>
        )}

        <button
          className={viewMode === "standings" ? "active" : ""}
          onClick={() => setViewMode("standings")}
        >
          Standings
        </button>

        {hasBracket && (
          <button
            className={viewMode === "bracket" ? "active" : ""}
            onClick={() => setViewMode("bracket")}
          >
            Playoffs
          </button>
        )}
      </div>

      {viewMode === "standings" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="league-container"
        >
          {standings.length === 1 ? (
            <>
              <table className="league-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    {["GP", "W", "D", "L", "GF", "GA", "GD", "PTS"].map(
                      (label) => (
                        <th key={label} className="individual-number">
                          {label}
                        </th>
                      )
                    )}
                    <th>Qualification or relegation</th>
                  </tr>
                </thead>
                <tbody>
                  {standings[0].map((team) => {
                    const { id, name } = team.team;
                    const { played, win, draw, lose, goals } = team.all;
                    const { for: goalsFor, against: goalsAgainst } = goals;

                    return (
                      <tr
                        key={id}
                        style={{
                          backgroundColor: getDescriptionColor(
                            team.description
                          ),
                        }}
                      >
                        <td className="individual-number">{team.rank}</td>
                        <td className="first-place">
                          <Link to={`/team/${id}`} className="table-team">
                            {name}
                          </Link>
                          {hasLeagueEnded() && team.rank === 1 && (
                            <strong>(C)</strong>
                          )}
                        </td>
                        <td className="individual-number">{played}</td>
                        <td className="individual-number">{win}</td>
                        <td className="individual-number">{draw}</td>
                        <td className="individual-number">{lose}</td>
                        <td className="individual-number">{goalsFor}</td>
                        <td className="individual-number">{goalsAgainst}</td>
                        <td className="individual-number">{team.goalsDiff}</td>
                        <td className="team-points">{team.points}</td>
                        <td>
                          <p className="table-description">
                            {team.description}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <div className="group-standings-grid">
              {standings.map((group, index) => {
                const groupName = group[0]?.group || `Group ${index + 1}`;

                return (
                  <div key={groupName} className="group-standings-card">
                    <h3>{groupName}</h3>
                    <table className="league-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Team</th>
                          {["GP", "W", "D", "L", "GF", "GA", "GD", "PTS"].map(
                            (label) => (
                              <th key={label} className="individual-number">
                                {label}
                              </th>
                            )
                          )}
                          <th>Qualification or relegation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.map((team) => {
                          const { id, name } = team.team;
                          const { played, win, draw, lose, goals } = team.all;
                          const { for: goalsFor, against: goalsAgainst } =
                            goals;

                          return (
                            <tr
                              key={id}
                              style={{
                                backgroundColor: getDescriptionColor(
                                  team.description
                                ),
                              }}
                            >
                              <td className="individual-number">{team.rank}</td>
                              <td className="table-team-container">
                                <Link to={`/team/${id}`} className="table-team">
                                  {name}
                                </Link>
                                {hasLeagueEnded() && team.rank === 1 && (
                                  <strong className="champion-mark">(C)</strong>
                                )}
                              </td>
                              <td className="individual-number">{played}</td>
                              <td className="individual-number">{win}</td>
                              <td className="individual-number">{draw}</td>
                              <td className="individual-number">{lose}</td>
                              <td className="individual-number">{goalsFor}</td>
                              <td className="individual-number">
                                {goalsAgainst}
                              </td>
                              <td className="individual-number">
                                {team.goalsDiff}
                              </td>
                              <td className="team-points">{team.points}</td>
                              <td className="table-description">
                                <p className="table-description">
                                  {team.description}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <hr />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {viewMode === "bracket" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="bracket-view"
        >
          {bracketData.length === 0 ? (
            <p>No bracket data available.</p>
          ) : (
            Object.entries(
              groupTwoLeggedTies(
                bracketData.filter(
                  (match) =>
                    !match.league.round?.toLowerCase().includes("qualifying")
                )
              ).reduce((acc, tie) => {
                const round = tie.round || "Unknown Round";
                if (!acc[round]) acc[round] = [];
                acc[round].push(tie);
                return acc;
              }, {})
            ).map(([round, ties], index, arr) => (
              <div key={round} className="bracket-round-group">
                <hr />
                <h3 className="bracket-round-title">{round}</h3>
                <div className="bracket-row">
                  {ties.map(({ fixtures, homeTeam, awayTeam }) => {
                    const aggregate = fixtures.reduce(
                      (acc, match) => {
                        const { home, away } = match.teams;
                        const goals = match.goals;

                        if (home.id === homeTeam.id) {
                          acc.home += goals.home;
                          acc.away += goals.away;
                        } else if (away.id === homeTeam.id) {
                          acc.home += goals.away;
                          acc.away += goals.home;
                        }

                        return acc;
                      },
                      { home: 0, away: 0 }
                    );

                    const isTwoLeggedTie = fixtures.length === 2;

                    return (
                      <div
                        key={homeTeam.id + awayTeam.id + round}
                        className="bracket-match-card"
                      >
                        <p className="bracket-aggregate">
                          {homeTeam.name} vs {awayTeam.name}{" "}
                          {isTwoLeggedTie && (
                            <p className="aggregate-score">
                              ({aggregate.home}–{aggregate.away} agg.)
                            </p>
                          )}
                        </p>
                        {fixtures.map((match) => {
                          const displayScore = getDisplayScore(match);
                          const date = new Date(
                            match.fixture.date
                          ).toLocaleDateString();
                          const { home, away } = match.teams;

                          return (
                            <Link
                              to={`/match/${match.fixture.id}`}
                              className="bracket-match-link"
                            >
                              <div
                                key={match.fixture.id}
                                className="bracket-match"
                              >
                                <p className="bracket-date">{date}</p>
                                <div className="bracket-team">
                                  <img
                                    className="bracket-logo"
                                    src={home.logo}
                                    alt={home.name}
                                  />
                                  <span>{home.name}</span>
                                  <strong>{displayScore.home}</strong>
                                </div>
                                <div className="bracket-team">
                                  <img
                                    className="bracket-logo"
                                    src={away.logo}
                                    alt={away.name}
                                  />
                                  <span>{away.name}</span>
                                  <strong>{displayScore.away}</strong>
                                </div>
                                {/* {displayScore.type !== 'FT' && (
                                <p className="score-type">({displayScore.type})</p>
                              )} */}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                {index < arr.length - 1 && <hr className="round-separator" />}
              </div>
            ))
          )}
        </motion.div>
      )}

      {viewMode === "qualification" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="qualification-view"
        >
          {renderQualificationBracket()}
        </motion.div>
      )}

      <hr className="solid"></hr>
      <div className="goals-assists">
        <div className="top-scorers">
          <h4>Top Scorers</h4>

          {topScorers?.some(
            (player) => (player.statistics[0].goals.total ?? 0) > 0
          ) ? (
            <table className="individual-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Goals</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastGoals = null;
                  let displayRank = 0;
                  let actualIndex = 0;

                  return topScorers
                    .sort(
                      (a, b) =>
                        (b.statistics[0].goals.total ?? 0) -
                        (a.statistics[0].goals.total ?? 0)
                    )
                    .slice(0, 10)
                    .map((player) => {
                      actualIndex++;
                      const goals = player.statistics[0].goals.total ?? 0;
                      if (goals !== lastGoals) {
                        displayRank = actualIndex;
                        lastGoals = goals;
                      }

                      return (
                        <tr key={player.player.id}>
                          <td>{displayRank}</td>
                          <td>
                            <a
                              className="player-link"
                              onClick={() => handlePlayerClick(player.player)}
                            >
                              {player.player.name}
                            </a>
                          </td>
                          <td>
                            <Link
                              to={`/team/${player.statistics[0].team.id}`}
                              className="individual-table-team"
                            >
                              {player.statistics[0].team.name}
                            </Link>
                          </td>
                          <td className="individual-number">{goals}</td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No top scorer data available.</p>
          )}
        </div>
        <hr className="solid"></hr>
        <div className="top-assists">
          <h4>Top Assists</h4>

          {topAssists?.some(
            (player) => (player.statistics?.[0]?.goals?.assists ?? 0) > 0
          ) ? (
            <table className="individual-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Assists</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastAssists = null;
                  let displayRank = 0;
                  let actualIndex = 0;

                  return topAssists
                    .sort(
                      (a, b) =>
                        (b.statistics[0].goals.assists ?? 0) -
                        (a.statistics[0].goals.assists ?? 0)
                    )
                    .slice(0, 10)
                    .map((player) => {
                      actualIndex++;
                      const assists = player.statistics[0].goals.assists ?? 0;
                      if (assists !== lastAssists) {
                        displayRank = actualIndex;
                        lastAssists = assists;
                      }

                      return (
                        <tr key={player.player.id}>
                          <td>{displayRank}</td>
                          <td>
                            <a
                              className="player-link"
                              onClick={() => handlePlayerClick(player.player)}
                            >
                              {player.player.name}
                            </a>
                          </td>
                          <td>
                            <Link
                              to={`/team/${player.statistics[0].team.id}`}
                              className="individual-table-team"
                            >
                              {player.statistics[0].team.name}
                            </Link>
                          </td>
                          <td className="individual-number">{assists}</td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No assists data available.</p>
          )}
        </div>
        <hr className="solid"></hr>
        <div className="top-red-cards">
          <h4>Red Cards</h4>

          {redCards?.some(
            (player) => (player.statistics[0].cards.red ?? 0) > 0
          ) ? (
            <table className="individual-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Reds</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let lastRed = null;
                  let displayRank = 0;
                  let actualIndex = 0;

                  return redCards
                    .sort(
                      (a, b) =>
                        (b.statistics[0].cards.red ?? 0) -
                        (a.statistics[0].cards.red ?? 0)
                    )
                    .filter(
                      (player) => (player.statistics[0].cards.red ?? 0) > 0
                    )
                    .slice(0, 10)
                    .map((player) => {
                      actualIndex++;
                      const red = player.statistics[0].cards.red ?? 0;
                      if (red !== lastRed) {
                        displayRank = actualIndex;
                        lastRed = red;
                      }

                      return (
                        <tr key={player.player.id}>
                          <td>{displayRank}</td>
                          <td>
                            <a
                              className="player-link"
                              onClick={() => handlePlayerClick(player.player)}
                            >
                              {player.player.name}
                            </a>
                          </td>
                          <td>
                            <Link
                              to={`/team/${player.statistics[0].team.id}`}
                              className="individual-table-team"
                            >
                              {player.statistics[0].team.name}
                            </Link>
                          </td>
                          <td className="individual-number">{red}</td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No red card data available.</p>
          )}
        </div>
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

export default LeagueInfo;

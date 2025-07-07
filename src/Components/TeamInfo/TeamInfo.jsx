import { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./TeamInfo.css";
import axios from "axios";
import Header from "../Header/Header";
import PlayerModal from "../PlayerModal/PlayerModal";
import { useNavigate } from "react-router-dom";

const TeamInfo = () => {
  const { teamId } = useParams();
  const [teamPage, setTeamPage] = useState(null);
  const [squad, setSquad] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [leaguePosition, setLeaguePosition] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coach, setCoach] = useState(null);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("results");

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const leaguesRes = await axios.get(
          "https://v3.football.api-sports.io/leagues",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: { team: teamId },
          }
        );

        const leagueEntry = leaguesRes.data.response[0];
        const currentSeasonData = leagueEntry?.seasons.find(
          (season) => season.current
        );
        const leagueId = leagueEntry.league.id;

        const today = new Date();
        const month = today.getMonth() + 1;
        let season;

        if (currentSeasonData) {
          const { start, end, year } = currentSeasonData;

          const startMonth = new Date(start).getMonth() + 1;
          const endMonth = new Date(end).getMonth() + 1;

          if (startMonth > endMonth) {
            season = month >= 7 ? today.getFullYear() : today.getFullYear() - 1;
          } else {
            season = today.getFullYear();
          }
        } else {
          season = today.getFullYear();
        }

        const [teamRes, squadRes, fixturesRes, standingsRes, coachRes] =
          await Promise.all([
            axios.get("https://v3.football.api-sports.io/teams", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { id: teamId },
            }),
            axios.get("https://v3.football.api-sports.io/players/squads", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { team: teamId },
            }),
            axios.get("https://v3.football.api-sports.io/fixtures", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { team: teamId, season },
            }),
            axios.get("https://v3.football.api-sports.io/standings", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: {
                season,
                team: teamId,
                league: leagueId,
              },
            }),
            await axios.get("https://v3.football.api-sports.io/coachs", {
              headers: {
                "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
              },
              params: { team: teamId },
            }),
          ]);

        const standingsData =
          standingsRes.data.response[0]?.league?.standings[0] || [];

        const teamStanding = standingsData.find(
          (entry) => entry.team.id == teamId
        );

        const currentCoach = coachRes.data.response.find((coach) => {
          const currentTeam = coach.career.find(
            (c) =>
              c.team.id == teamId &&
              (!c.end || new Date(c.end) >= new Date(today)) &&
              new Date(c.start) <= new Date(today)
          );
          return !!currentTeam;
        });

        setCoach(currentCoach || null);

        setLeaguePosition(teamStanding?.rank || "N/A");
        setTeamPage(teamRes.data.response[0]);
        setSquad(squadRes.data.response[0].players);
        setFixtures(fixturesRes.data.response);
      } catch (err) {
        console.error("Failed to fetch team data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const isSmallScreen = window.innerWidth <= 768;

  return (
    <div className="team-info-main">
      <Header />
      {loading ? (
        <p>Loading team info...</p>
      ) : !teamPage ? (
        <p>Team not found.</p>
      ) : (
        (() => {
          const { team, venue } = teamPage;

          const pastFixtures = fixtures
            .filter((fixture) => fixture.fixture.status.short === "FT")
            .sort(
              (a, b) => new Date(b.fixture.date) - new Date(a.fixture.date)
            );

          const upcomingFixtures = fixtures
            .filter((fixture) =>
              ["NS", "TBD"].includes(fixture.fixture.status.short)
            )
            .sort(
              (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
            );

          return (
            <>
              <div className="teaminfo-header">
                <div className="facts-container">
                  <img src={team.logo} alt="logo" className="team-info-logo" />
                  <div className="team-facts">
                    <h2>{team.name}</h2>
                    <p>Established {team.founded}</p>
                    <p>
                      {venue.city}, {team.country}
                    </p>
                    <p>
                      {venue.name} - {venue.capacity}
                    </p>
                    <p>League position: {leaguePosition}</p>
                  </div>
                  <div className="team-facts">
                    {coach && (
                      <div className="coach-info">
                        <h4 className="squad-type-title">Manager</h4>
                        <div className="coachphoto-name">
                          {/* <img
                            src={coach.photo}
                            alt={coach.name}
                            className="coach-photo"
                            style={{
                              width: "60px",
                              borderRadius: "50%",
                              marginBottom: "0.5rem",
                            }}
                          /> */}
                          <p title={`${coach.firstname} ${coach.lastname}`}>
                            {coach.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="teaminfo-container">
                <div className="squad">
                  <div className="squad-columns">
                    <div className="squad-column">
                      {squad &&
                        Object.entries(
                          squad.reduce((acc, player) => {
                            const position = player.position || "Unknown";
                            if (!acc[position]) acc[position] = [];
                            acc[position].push(player);
                            return acc;
                          }, {})
                        )
                          .filter(([position]) =>
                            ["Goalkeeper", "Defender"].includes(position)
                          )
                          .map(([position, players]) => (
                            <div key={position} className="squad-group">
                              <h4 className="squad-type-title">{position}s</h4>
                              <ul className="squad-list">
                                {players.map((player) => (
                                  <li
                                    key={player.id}
                                    onClick={() =>
                                      setSelectedPlayer({
                                        id: player.id,
                                        number: player.number,
                                      })
                                    }
                                  >
                                    <img
                                      src={player.photo}
                                      alt={player.name}
                                      className="player-photo"
                                      loading="lazy"
                                    />
                                    {player.number}. {player.name}
                                    {/*  ({player.age} years) */}
                                  </li>
                                ))}
                              </ul>
                              <hr className="mid-divder" />
                            </div>
                          ))}
                    </div>
                    <div className="squad-column">
                      {squad &&
                        Object.entries(
                          squad.reduce((acc, player) => {
                            const position = player.position || "Unknown";
                            if (!acc[position]) acc[position] = [];
                            acc[position].push(player);
                            return acc;
                          }, {})
                        )
                          .filter(
                            ([position]) =>
                              !["Goalkeeper", "Defender"].includes(position)
                          )
                          .map(([position, players]) => (
                            <div key={position} className="squad-group">
                              <h4 className="squad-type-title">{position}s</h4>
                              <ul className="squad-list">
                                {players.map((player) => (
                                  <li
                                    key={player.id}
                                    onClick={() =>
                                      setSelectedPlayer({
                                        id: player.id,
                                        number: player.number,
                                      })
                                    }
                                  >
                                    <img
                                      src={player.photo}
                                      alt={player.name}
                                      className="player-photo"
                                      loading="lazy"
                                    />
                                    {player.number}. {player.name}{" "}
                                    {/* ({player.age} years) */}
                                  </li>
                                ))}
                              </ul>
                              <hr className="mid-divder" />
                            </div>
                          ))}
                    </div>
                  </div>

                  <PlayerModal
                    playerId={selectedPlayer?.id}
                    squadNumber={selectedPlayer?.number}
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    team={teamPage.team}
                  />
                </div>
                <hr className="mid-divider" />
                <div className="results">
                  <div className="results-toggle-buttons">
                    <button
                      onClick={() => setActiveView("results")}
                      className={activeView === "results" ? "active" : ""}
                    >
                      Results
                    </button>
                    <button
                      onClick={() => setActiveView("upcoming")}
                      className={activeView === "upcoming" ? "active" : ""}
                    >
                      Fixtures
                    </button>
                  </div>

                  {activeView === "results" && (
                    <div className="results-list">
                      <div className="result-legend">
                        <span className="legend-item win">Win</span>
                        <span className="legend-item draw">Draw</span>
                        <span className="legend-item loss">Loss</span>
                      </div>
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Fixture</th>
                            <th>Competition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pastFixtures.map((fixture) => {
                            const matchDate = new Date(
                              fixture.fixture.date
                            ).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: isSmallScreen ? "numeric" : "long", 
                              day: "numeric",
                            });

                            const isHome = fixture.teams.home.id == team.id;
                            const goalsFor = isHome
                              ? fixture.goals.home
                              : fixture.goals.away;
                            const goalsAgainst = isHome
                              ? fixture.goals.away
                              : fixture.goals.home;

                            let resultClass = "draw";
                            if (goalsFor > goalsAgainst) resultClass = "win";
                            else if (goalsFor < goalsAgainst)
                              resultClass = "loss";

                            return (
                              <tr
                                key={fixture.fixture.id}
                                className="result-item"
                              >
                                <td className="fixture-date">{matchDate}</td>
                                <td
                                  className={resultClass}
                                  onClick={() =>
                                    navigate(`/match/${fixture.fixture.id}`)
                                  }
                                >
                                  {fixture.teams.home.name} {fixture.goals.home}{" "}
                                  - {fixture.goals.away}{" "}
                                  {fixture.teams.away.name}
                                </td>
                                <td className="fixture-league">
                                  {fixture.league?.name || "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeView === "upcoming" && (
                    <div className="results-list">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Fixture</th>
                            <th>Competition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingFixtures.map((fixture) => {
                            const matchDate = new Date(
                              fixture.fixture.date
                            ).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: isSmallScreen ? "numeric" : "long", 
                              day: "numeric",
                            });

                            return (
                              <tr key={fixture.fixture.id}>
                                <td className="fixture-date">{matchDate}</td>
                                <td className="fixture-teams">
                                  {fixture.teams.home.name} -{" "}
                                  {fixture.teams.away.name}
                                </td>
                                <td className="fixture-league">
                                  {fixture.league?.name || "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
};

export default TeamInfo;

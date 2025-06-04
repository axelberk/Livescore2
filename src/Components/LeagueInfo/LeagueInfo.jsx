import "./LeagueInfo.css";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import TeamInfo from "../TeamInfo/TeamInfo";
import { Link } from "react-router-dom";
import { styled } from "@mui/material";

const LeagueInfo = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [seasonYear, setSeasonYear] = useState(null);
  const [topAssists, setTopAssists] = useState([]);
  const [redCards, setRedCards] = useState([]);

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

        const currentSeason = leagueData.seasons.find(
          (season) => season.current
        )?.year;
        setSeasonYear(currentSeason);
      } catch (err) {
        console.error("Failed to fetch league info:", err);
      }
    };

    fetchLeague();
  }, [leagueId]);

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

        setStandings(standingsRes.data.response[0]?.league?.standings[0] || []);
        setTopScorers(scorersRes.data.response || []);
        setTopAssists(assistsRes.data.response || []);
        setRedCards(redCardsRes.data.response || []);
      } catch (err) {
        console.error("Failed to fetch standings or top scorers:", err);
      }
    };

    fetchDetails();
  }, [seasonYear, leagueId]);

  if (!league) return <div>Loading league info...</div>;

  return (
    <div className="league-info">
      <Header />
      <div className="leagueinfo-header">
        <img
          src={league.league.logo}
          alt="League logo"
          style={{ height: 40 }}
        />
        <h2>{league.league.name}</h2>
      </div>

      <p className="league-season">Season: {seasonYear}</p>

      <div className="league-container">
        <h3>League Table</h3>
        <table className="league-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>GP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>PTS</th>
              <th>Qualification or relegation</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => (
              <tr
                key={team.team.id}
                style={{
                  backgroundColor: getDescriptionColor(team.description),
                }}
              >
                <td>{team.rank}</td>
                <td>
                  <Link to={`/team/${team.team.id}`} className="table-team">
                    {team.team.name}
                  </Link>
                </td>
                <td>{team.all.played}</td>
                <td>{team.all.win}</td>
                <td>{team.all.draw}</td>
                <td>{team.all.lose}</td>
                <td>{team.points}</td>
                <td>{team.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="goals-assists">
        <div className="top-scorers">
          <h3>Top Scorers</h3>
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
                        <td>{player.player.name}</td>
                        <td>{player.statistics[0].team.name}</td>
                        <td className="individual-number">{goals}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>

        <div className="top-assists">
          <h3>Top Assists</h3>
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
                        <td>{player.player.name}</td>
                        <td>{player.statistics[0].team.name}</td>
                        <td className="individual-number">{assists}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>

        <div className="top-red-cards">
          <h3>Red Cards</h3>
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
                  .filter((player) => (player.statistics[0].cards.red ?? 0) > 0)
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
                        <td>{player.player.name}</td>
                        <td>{player.statistics[0].team.name}</td>
                        <td className="individual-number">{red}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeagueInfo;

{
  /* <table className="top-players">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
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
                .map((player, index, arr) => {
                  actualIndex += 1;
                  const goals = player.statistics[0].goals.total ?? 0;
                  if (goals !== lastGoals) {
                    displayRank = actualIndex;
                    lastGoals = goals;
                  }

                  return (
                    <li key={player.player.id}>
                      {displayRank}. {player.player.name} (
                      {player.statistics[0].team.name}) – {goals} goals
                    </li>
                  );
                });
            })()}
          </tbody>
        </table> */
}

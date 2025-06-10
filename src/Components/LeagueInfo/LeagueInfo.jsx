import "./LeagueInfo.css";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import TeamInfo from "../TeamInfo/TeamInfo";
import { Link } from "react-router-dom";
import { styled } from "@mui/material";
import PlayerModal from "../PlayerModal/PlayerModal";

const LeagueInfo = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [seasonYear, setSeasonYear] = useState(null);
  const [topAssists, setTopAssists] = useState([]);
  const [redCards, setRedCards] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const handlePlayerClick = (player) => {
  setSelectedPlayerId(player);
};

const closeModal = () => {
  setSelectedPlayer(null);
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

const hasLeagueEnded = () => {
  if (!league || !league.seasons) return false; 

  const season = league.seasons.find((s) => s.year === seasonYear);
  if (!season?.end) return false;

  return new Date(season.end) < new Date(); 
};

const formatSeasonLabel = (season) => {
  if (!season?.start || !season?.end) return season?.year ?? "";

  const startYear = new Date(season.start).getFullYear();  
  const endYear   = new Date(season.end).getFullYear();     

  if (startYear === endYear) return `${startYear}`;

  const endYY = String(endYear).slice(-2);
  return `${startYear}-${endYY}`;
};

const currentSeasonObj = league?.seasons?.find(s => s.current);
const seasonLabel = formatSeasonLabel(currentSeasonObj);
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

      <p className="league-season">Season: {seasonLabel}</p>
      <p className="league-season">Holders</p>
      <hr class="solid"></hr>
      <div className="league-container">
        <h3>League Table</h3>
        <table className="league-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Team</th>
      {["GP", "W", "D", "L", "GF", "GA", "GD", "PTS"].map((label) => (
        <th key={label} className="individual-number">{label}</th>
      ))}
      <th>Qualification or relegation</th>
    </tr>
  </thead>
  <tbody>
    {standings.map((team) => {
      const { id, name } = team.team;
      const { played, win, draw, lose, goals } = team.all;
      const { for: goalsFor, against: goalsAgainst } = goals;

      return (
        <tr
          key={id}
          style={{
            backgroundColor: getDescriptionColor(team.description),
          }}
        >
          <td>{team.rank}</td>
         <td>
  <Link to={`/team/${id}`} className="table-team">
    {name}
  </Link> 
   {hasLeagueEnded() && team.rank === 1 && <strong>(C)</strong>}
</td>
          <td className="individual-number">{played}</td>
          <td className="individual-number">{win}</td>
          <td className="individual-number">{draw}</td>
          <td className="individual-number">{lose}</td>
          <td className="individual-number">{goalsFor}</td>
          <td className="individual-number">{goalsAgainst}</td>
          <td className="individual-number">{team.goalsDiff}</td>
          <td className="team-points">{team.points}</td>
          <td>{team.description || "-"}</td>
        </tr>
      );
    })}
  </tbody>
</table>

      </div>
      <hr class="solid"></hr>
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
                        <td>
  <a className="player-link" onClick={() => handlePlayerClick(player.player)}>
    {player.player.name}
  </a>
</td>
                        <td>{player.statistics[0].team.name}</td>
                        <td className="individual-number">{goals}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>
        <hr class="solid"></hr>
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
                       <td>
  <a className="player-link" onClick={() => handlePlayerClick(player.player)}>
    {player.player.name}
  </a>
</td>
                        <td>{player.statistics[0].team.name}</td>
                        <td className="individual-number">{assists}</td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>
        <hr class="solid"></hr>
        <div className="top-red-cards">
          <h3>
            Red Cards{" "}
            <img src="/Red_card.svg" alt="" className="individual-logo" />
          </h3>
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
                       <td>
  <a className="player-link" onClick={() => handlePlayerClick(player.player)}>
    {player.player.name}
  </a>
</td>
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

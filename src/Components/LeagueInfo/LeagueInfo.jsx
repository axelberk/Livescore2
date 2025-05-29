import "./LeagueInfo.css";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";

const LeagueInfo = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [seasonYear, setSeasonYear] = useState(null);

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const res = await axios.get("https://v3.football.api-sports.io/leagues", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: { id: leagueId },
        });

        const leagueData = res.data.response[0];
        setLeague(leagueData);

        const currentSeason = leagueData.seasons.find(season => season.current)?.year;
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
        const [standingsRes, scorersRes] = await Promise.all([
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
        ]);

        setStandings(standingsRes.data.response[0]?.league?.standings[0] || []);
        setTopScorers(scorersRes.data.response || []);
      } catch (err) {
        console.error("Failed to fetch standings or top scorers:", err);
      }
    };

    fetchDetails();
  }, [seasonYear, leagueId]);

  if (!league) return <div>Loading league info...</div>;

  return (
    <div>
      <Header />
      <h2>{league.league.name}</h2>
      <img src={league.league.logo} alt="League logo" style={{ height: 40 }} />
      <p>Current Season: {seasonYear}</p>

      <div className="league-container">
        <h3>League Phase</h3>
        <div className="league-table">
          {standings.map(team => (
            <div key={team.team.id} className="league-phase">
              {team.rank}. {team.team.name} - {team.points} pts
            </div>
          ))}
        </div>
      </div>

      <div className="top-scorers">
        <h3>Top Scorers</h3>
        <ol>
          {topScorers.map(player => (
            <li key={player.player.id}>
              {player.player.name} ({player.statistics[0].team.name}) - {player.statistics[0].goals.total} goals
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default LeagueInfo;

import { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./TeamInfo.css";
import axios from "axios";

const currentSeason = "2024";

const TeamInfo = () => {
  const { teamId } = useParams();
  const [teamPage, setTeamPage] = useState(null);
  const [squad, setSquad] = useState(null);
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [teamRes, squadRes, fixturesRes] = await Promise.all([
          axios.get("https://v3.football.api-sports.io/teams", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: { id: teamId },
          }),
          axios.get("https://v3.football.api-sports.io/players", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              team: teamId,
              season: currentSeason,
            },
          }),
          axios.get("https://v3.football.api-sports.io/fixtures", {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              team: teamId,
              season: currentSeason,
            },
          }),
        ]);

        setTeamPage(teamRes.data.response[0]);
        const players = squadRes.data.response.map((entry) => entry.player);
        setSquad(players);
        setFixtures(fixturesRes.data.response);
      } catch (err) {
        console.error("Failed to fetch team data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (loading) return <p>Loading team info...</p>;
  if (!teamPage) return <p>Team not found.</p>;

  const { team, venue } = teamPage;

  const pastFixtures = fixtures
  .filter((fixture) => fixture.fixture.status.short === "FT")
  .sort((b, a) => new Date(b.fixture.date) - new Date(a.fixture.date)); 

const upcomingFixtures = fixtures
  .filter((fixture) => ["NS", "TBD"].includes(fixture.fixture.status.short))
  .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)); 

  return (
    <div className="team-info-main">
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
        </div>
      </div>
      <div className="teaminfo-container">
        <div className="squad">
          <h3>Squad</h3>
          {Object.entries(
            squad.reduce((acc, player) => {
              const position = player.position || "Unknown";
              if (!acc[position]) acc[position] = [];
              acc[position].push(player);
              return acc;
            }, {})
          ).map(([position, players]) => (
            <div key={position} className="squad-group">
              <h4>{position}</h4>
              <ul className="squad-list">
                {players.map((player) => (
                  <li key={player.id}>
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="player-photo"
                    />
                    {player.name} ({player.age} years)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="results">
  <h3>Results this season</h3>
  <div className="results-list">
    {pastFixtures.map((fixture) => {
      const { id, date, teams, goals } = fixture;
      const matchDate = new Date(fixture.fixture.date).toLocaleDateString("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
      return (
        <div key={id} className="result-item">
          <strong>{matchDate}</strong>: {teams.home.name} {goals.home} - {goals.away} {teams.away.name}
        </div>
      );
    })}
  </div>

  <h3>Upcoming Fixtures</h3>
  <div className="results-list">
    {upcomingFixtures.map((fixture) => {
      const { id, date, teams } = fixture;
      const matchDate = new Date(fixture.fixture.date).toLocaleDateString("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
      return (
        <div key={id} className="result-item">
          <strong>{matchDate}</strong>: {teams.home.name} vs {teams.away.name}
        </div>
      );
    })}
  </div>
</div>
      </div>
    </div>
  );
};

export default TeamInfo;

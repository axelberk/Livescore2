import { useState, useEffect } from "react";
import axios from "axios";
import "./LiveScores.css";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Link } from "react-router-dom";
import LeagueInfo from "../LeagueInfo/LeagueInfo";
import { Skeleton, Box } from "@mui/material";

const allowedLeagues = [39, 113, 140, 2, 848, 3, 78, 61, 135, 88, 40, 114, 5, 10, 15];

const ScoreSkeleton = () => (
  <Box padding={2} className="league-display">
    <div className="league-header">
      <Skeleton width={100} height={24} />
      <Skeleton variant="text" width="3%" height={24} sx={{ mx: 1 }} />
    </div>

    {[...Array(3)].map((_, i) => (
      <div key={i} className="match-card">
        <div className="match-time">
          <Skeleton variant="text" width="24px" height={20} />
        </div>
        <div className="match-teams">
          <Skeleton variant="circular" width={24} height={20} />
          <Skeleton variant="text" width="20%" height={20} sx={{ mx: 1 }} />
          <Skeleton variant="text" width="20%" height={20} sx={{ mx: 1 }} />
          <Skeleton variant="circular" width={24} height={20} />
        </div>
        <div className="match-result">
          <Skeleton variant="text" width="20px" height={20} />
        </div>
      </div>
    ))}
  </Box>
);

const LiveScores = ({ selectedDate, setSelectedMatch }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split("T")[0];

      try {
        const response = await axios.get(
          "https://v3.football.api-sports.io/fixtures",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              date: formattedDate,
            },
          }
        );

        const filtered = response.data.response.filter((match) =>
          allowedLeagues.includes(match.league.id)
        );

        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching live scores", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();
  }, [selectedDate]);

  return (
    <div className="Livescores">
     {loading ? (
  <>
    <ScoreSkeleton />
    <ScoreSkeleton />
    <ScoreSkeleton />
  </>
) : matches.length === 0 ? (
  <p>No fixtures today.</p>
) : (
  Object.entries(
    matches.reduce((acc, match) => {
      const leagueName = match.league.name;
      if (!acc[leagueName]) acc[leagueName] = [];
      acc[leagueName].push(match);
      return acc;
    }, {})
  ).map(([leagueName, leagueMatches]) => (
          <div key={leagueName} className="league-display">
            <Link
              to={`/league/${leagueMatches[0].league.id}`}
              className="league-header"
            >
              <img
                src={leagueMatches[0].league.logo}
                alt={`${leagueMatches[0].league.name} logo`}
                className="league-logo"
                loading="lazy"
              />
              <p>{leagueMatches[0].league.name}</p>
              <ArrowRightIcon />
            </Link>

            {leagueMatches.map((match) => (
              <div
                key={match.fixture.id}
                className="match-card"
                onClick={() => setSelectedMatch(match)}
              >
                <div className="match-time">
                  {new Date(match.fixture.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                </div>

               
                <div className="match-teams">
                  <img
                    src={match.teams.home.logo}
                    alt={`${match.teams.home.name} logo`}
                    className="team-logo"
                    loading="lazy"
                  />
                  {match.teams.home.name} - {match.teams.away.name}
                  <img
                    src={match.teams.away.logo}
                    alt={`${match.teams.away.name} logo`}
                    className="team-logo"
                    loading="lazy"
                  />
                </div>{" "}
                <div className="match-result">
                  {match.goals.home}-{match.goals.away}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default LiveScores;

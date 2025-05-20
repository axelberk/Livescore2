import { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./TeamInfo.css";
import axios from "axios";


const currentSeason = "2023";

const TeamInfo = () => {
  const { teamId } = useParams();
  const [teamPage, setTeamPage] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get("https://v3.football.api-sports.io/teams", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: {
            id: teamId,
          },
        });

        setTeamPage(res.data.response[0]);
      } catch (err) {
        console.error("Failed to fetch team info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) return <div>Loading...</div>;

  if (!teamPage) return <div>Team not found.</div>;

 

  if (loading) return <p>Loading team info...</p>;
  if (!teamPage) return <p>Team not found.</p>;

  const { team, venue } = teamPage;

  return (
    <div className="teaminfo-container">
      <div className="team-facts">
        <img src={team.logo} alt="logo" />
        <h2>{team.name}</h2>
        <p>Founded in {team.founded}</p>
        <p>{venue.city}, Country</p>
        <p>
          {venue.name} - {venue.capacity}
        </p>
      </div>
      
    </div>
  );
};

export default TeamInfo;

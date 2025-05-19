import { useState, useEffect } from "react"
import { useParams } from "react-router";
import "./TeamInfo.css"
import axios from "axios";

const { teamId } = useParams();
const [teamPage, setTeamPage] = useState(null)
const [loading, setLoading] = useState(true)


const TeamInfo = (params) => {
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
            setLoading(false)
        }
      };
  
      fetchTeam();
    }, [teamId]);

      if (loading) return <p>Loading team info...</p>;
  if (!teamPage) return <p>Team not found.</p>;

  const { team, venue } = teamPage

    return (
        <div>
            Hey
        </div>
    )
}

export default TeamInfo
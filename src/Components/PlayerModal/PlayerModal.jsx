import "./PlayerModal.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

const PlayerModal = ({ playerId, isOpen, onClose, team, squadNumber }) => {
  const [closing, setClosing] = useState(false);
  const [player, setPlayer] = useState(null);
  const numberFromLineup = squadNumber;
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    if (!playerId || !isOpen) return;

    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://v3.football.api-sports.io/players",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              id: playerId,
              season: "2024",
            },
            
          }
          
        );
        setPlayer(res.data.response[0] || null);
      } catch (err) {
        console.error("Failed to fetch player data", err);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayer();
  }, [playerId, isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;



  return (
  <>
    <div className="modal-overlay" onClick={handleClose} />
    <div className={`player-modal${closing ? " closing" : ""}`}>
      <div className="button-header">
        {player?.player?.photo && (
          <img
            src={player.player.photo}
            alt={player.player.name}
            className="player-photo-lg"
          />
        )}
        <button onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <div className="modal-content">
        {loading ? (
          <p>Loading player info...</p>
        ) : !player || !player.player ? (
          <p>Player data not available.</p>
        ) : (
          <>
            <h2 className="modal-name">
              {player?.statistics?.[0]?.games?.number ?? player?.player?.number ?? numberFromLineup ?? "N/A"}
              {". "}
              {player.player.firstname} {player.player.lastname}
            </h2>
            <div className="modal-facts-container">
              <div className="modal-facts">
                <p>Date of birth: <span className="fact-span">{player.player.birth.date} ({player.player.age} years)</span></p>
                <p>Position: <span className="fact-span">{player.statistics?.[0]?.games?.position || "Unknown"}</span></p>
                <p>Height: <span className="fact-span">{player.player.height || "N/A"}</span></p>
                <p>Weight: <span className="fact-span">{player.player.weight || "N/A"}</span></p>
                <p>Nationality: <span className="fact-span">{player.player.nationality || "N/A"}</span></p>
              </div>
              <div className="modal-facts">
                <p>
                  Appearances: <span className="fact-span">{player.statistics?.[0]?.games?.appearences ?? 0}</span>
                </p>
                {player.statistics?.[0]?.games?.position === "Goalkeeper" ? (
                  <>
                    <p>Goals Conceded: <span className="fact-span">{player.statistics?.[0]?.goals?.conceded ?? 0}</span></p>
                  </>
                ) : (
                  <>
                    <p>Goals: <span className="fact-span">{player.statistics?.[0]?.goals?.total ?? 0}</span></p>
                    <p>Assists: <span className="fact-span">{player.statistics?.[0]?.goals?.assists ?? 0}</span></p>
                  </>
                )}
                <p>Yellow Cards: <span className="fact-span">{player.statistics?.[0]?.cards?.yellow ?? 0}</span></p>
                <p>Red Cards: <span className="fact-span">{player.statistics?.[0]?.cards?.red ?? 0}</span></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </>
);
};

export default PlayerModal;

import "./PlayerModal.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

const PlayerModal = ({ playerId, isOpen, onClose, team }) => {
  const [closing, setClosing] = useState(false);
  const [player, setPlayer] = useState(null);
  const numberFromLineup = playerId?.number;
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
    <div className={`player-modal${closing ? " closing" : ""}`}>
      <div className="button-header">
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
            <img
              src={player.player.photo}
              alt={player.player.name}
              className="player-photo-lg"
            />
            <div className="modal-facts">
              <h3>
                {player.player.firstname} {player.player.lastname}
              </h3>

              <p>
                Position: {player.statistics?.[0]?.games?.position || "Unknown"}
              </p>
              <p>Age: {player.player.age ?? "?"}</p>
              <p>Height: {player.player.height || "?"}</p>
              <p>Weight: {player.player.weight || "?"}</p>
              <p>Nationality: {player.player.nationality || "?"}</p>
              <p>
                Number:{" "}
                {player?.statistics?.[0]?.games?.number ??
                  player?.player?.number ??
                  numberFromLineup ??
                  "N/A"}
              </p>
              <p>
                Appearances: {player.statistics?.[0]?.games?.appearences ?? 0}
              </p>
              <p>Goals: {player.statistics?.[0]?.goals?.total ?? 0}</p>
              <p>Assists: {player.statistics?.[0]?.goals?.assists ?? 0}</p>
              <p>Yellow Cards: {player.statistics?.[0]?.cards?.yellow ?? 0}</p>
              <p>Red Cards: {player.statistics?.[0]?.cards?.red ?? 0}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerModal;

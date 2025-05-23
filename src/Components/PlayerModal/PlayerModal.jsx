import "./PlayerModal.css"
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

const PlayerModal = ({ player, isOpen, onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) setClosing(false);
  }, [isOpen]);

  if (!isOpen || !player) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  return (
    <div className={`player-modal${closing ? " closing" : ""}`}>
      <div className="modal-content">
        <div className="button-header">
          <button onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <h3>{player.name}</h3>
        <p>{player.statistics?.[0]?.games?.position || "Position unknown"}</p>
        <p>Goals: {player.statistics?.[0]?.goals?.total ?? 0}</p>
        <p>Assists: {player.statistics?.[0]?.goals?.assists ?? 0}</p>
        <p>Age: {player.age || "?"}</p>
        <p>Height: {player.height || "?"}</p>
      </div>
    </div>
  );
};

export default PlayerModal;

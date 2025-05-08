import "./Lineup.css";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";

const Lineup = ({ team, color, isAway, goalScorerIds = new Set() }) => {
  if (!team || !team.formation || !team.startXI) return null;

  const formationRows = team.formation.split("-").map(Number);
  const goalkeeper = team.startXI[0].player;
  const outfieldPlayers = team.startXI.slice(1).map((p) => p.player);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [closing, setClosing] = useState(false);

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setSelectedPlayer(null);
      setClosing(false);
    }, 200);
  };

  const players = isAway ? [...outfieldPlayers].reverse() : outfieldPlayers;
  let playerIndex = 0;

  const renderRow = (numPlayers, i) => {
    const row = players.slice(playerIndex, playerIndex + numPlayers);
    playerIndex += numPlayers;
    return (
      <div key={i} className="formation-row">
        {row.map((p, j) => (
          <div key={j} className="player" onClick={() => setSelectedPlayer(p)}>
            {p.name}
            {goalScorerIds.has(p.id) && (
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ marginLeft: "5px", color: "black" }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const orderedRows = isAway ? [...formationRows].reverse() : formationRows;

  return (
    <div className="pitch" style={{ borderColor: color }}>
      {!isAway && (
        <div className="goalkeeper">
          <div className="player" onClick={() => setSelectedPlayer(goalkeeper)}>
            {goalkeeper.name}
            {goalScorerIds.has(goalkeeper.id) && (
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ marginLeft: "5px", color: "blue" }}
              />
            )}
          </div>
        </div>
      )}

      {orderedRows.map((num, i) => renderRow(num, i))}

      {isAway && (
        <div className="goalkeeper">
          <div className="player" onClick={() => setSelectedPlayer(goalkeeper)}>
            {goalkeeper.name}
            {goalScorerIds.has(goalkeeper.id) && (
              <FontAwesomeIcon
                icon={faFutbol}
                style={{ marginLeft: "5px", color: "black" }}
              />
            )}
          </div>
        </div>
      )}

      {selectedPlayer && (
        <div className={`player-modal${closing ? " closing" : ""}`}>
          <div className="modal-content">
            <div className="button-header">
              <button onClick={closeModal}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <h3>{selectedPlayer.name}</h3>
            <p>years</p>
            <p>{selectedPlayer.statistics?.[0]?.games?.position}</p>
            <p>cm</p>
            <p>goals</p>
            <p>assists</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lineup;

import "./Lineup.css";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const Lineup = ({ team, color, isAway, goalScorerIds = new Set(), substitutes}) => {
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
              <SportsSoccerIcon fontSize="small" style={{height:"14px", alignSelf:"center"}}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const orderedRows = isAway ? [...formationRows].reverse() : formationRows;

  return (
  <div className="lineup-wrapper">
    <div className="pitch" style={{ borderColor: color }}>
      {!isAway && (
        <div className="goalkeeper">
          <div className="player" onClick={() => setSelectedPlayer(goalkeeper)}>
            {goalkeeper.name}
            {goalScorerIds.has(goalkeeper.id) && <SportsSoccerIcon fontSize="small" style={{ height: "14px" }} />}
          </div>
        </div>
      )}

      {orderedRows.map((num, i) => renderRow(num, i))}

      {isAway && (
        <div className="goalkeeper">
          <div className="player" onClick={() => setSelectedPlayer(goalkeeper)}>
            {goalkeeper.name}
            {goalScorerIds.has(goalkeeper.id) && <SportsSoccerIcon fontSize="small" style={{ height: "14px" }} />}
          </div>
        </div>
      )}
    </div>

    {substitutes.length > 0 && (
      <div className="substitutes-box">
        <h4>Substitutes</h4>
        {substitutes.map((sub, i) => (
          <div key={i} className="player-substitute" onClick={() => setSelectedPlayer(sub.player)}>
            {sub.player.name}
            {goalScorerIds.has(sub.player.id) && <SportsSoccerIcon fontSize="small" style={{ height: "14px" }} />}
          </div>
        ))}
      </div>
    )}

    {selectedPlayer && (
      <div className={`player-modal${closing ? " closing" : ""}`}>
        <div className="modal-content">
          <div className="button-header">
            <button onClick={closeModal}><CloseIcon fontSize="small" /></button>
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

import "./Lineup.css";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from '@mui/icons-material/Loop';

const Lineup = ({ team, color, isAway, goalScorerIds = new Set(), substitutes = [], substitutions = [] }) => {
  if (!team || !team.formation || !team.startXI) return null;

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [closing, setClosing] = useState(false);

  const subbedOffIds = new Set(substitutions.map((subs) => subs.player_out?.id).filter(Boolean));
  const subbedOnIds = new Set(substitutions.map((subs) => subs.player_in?.id).filter(Boolean));

  const getFormationGroups = (players, formation) => {
    const formationArray = formation.split("-").map(Number);
    const goalkeeper = players[0].player;
    let index = 1;
    const rows = formationArray.map((count) => {
      const group = players.slice(index, index + count).map((p) => p.player);
      index += count;
      return group;
    });
    return { goalkeeper, rows };
  };

  const { goalkeeper, rows } = getFormationGroups(team.startXI, team.formation);
  const orderedRows = isAway ? [...rows].reverse() : rows;
  const orderedGoalkeeper = goalkeeper;

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setSelectedPlayer(null);
      setClosing(false);
    }, 200);
  };

   const renderRow = (row, rowIndex) => (
    <div key={rowIndex} className="formation-row">
      {(isAway ? [...row].reverse() : row).map((player, i) => (
        <div key={i} className="player" onClick={() => setSelectedPlayer(player)}>
          {player.name}
          {goalScorerIds.has(player.id) && (
            <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 4 }} />
          )}
          {subbedOffIds.has(player.id) && (
            <LoopIcon fontSize="small" style={{ marginLeft: 4 }} />
          )}
        </div>
      ))}
    </div>
  );


   const renderGoalkeeper = (keeper) => (
    <div className="goalkeeper">
      <div className="player" onClick={() => setSelectedPlayer(keeper)}>
        {keeper.name}
        {goalScorerIds.has(keeper.id) && (
          <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 4 }} />
        )}
      </div>
    </div>
  );

  return (
    <div className="lineup-wrapper">
      <div className="pitch" style={{ borderColor: color }}>
        <div className={`formation-display ${isAway ? "away-formation" : "home-formation"}`}>
          {team.formation}
        </div>

        {!isAway && renderGoalkeeper(orderedGoalkeeper)}
        {orderedRows.map(renderRow)}
        {isAway && renderGoalkeeper(orderedGoalkeeper)}
      </div>

      {substitutes.length > 0 && (
        <div className="substitutes-box">
          <h4>Substitutes</h4>
          {substitutes.map((sub, i) => (
            <div
              key={i}
              className="player-substitute"
              onClick={() => setSelectedPlayer(sub.player)}
            >
              {sub.player.name}
              {goalScorerIds.has(sub.player.id) && (
                <SportsSoccerIcon fontSize="small" style={{ height: "12px", marginLeft: 4 }} />
              )}
              {subbedOnIds.has(sub.player.id) && (
                <LoopIcon fontSize="small" style={{ marginLeft: 4 }} />
              )}
            </div>
          ))}
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
            <p>{selectedPlayer.statistics?.[0]?.games?.position || "Position unknown"}</p>
            <p>Goals: {selectedPlayer.statistics?.[0]?.goals?.total ?? 0}</p>
            <p>Assists: {selectedPlayer.statistics?.[0]?.goals?.assists ?? 0}</p>
            <p>Age: {selectedPlayer.age || "?"}</p>
            <p>Height: {selectedPlayer.height || "?"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lineup;

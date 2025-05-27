import "./Lineup.css";
import { useState } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from '@mui/icons-material/Loop';
import PlayerModal from "../PlayerModal/PlayerModal";

const Lineup = ({ team, color, isAway, goalCounts = new Map(), substitutes = [], substitutions = [] , isOpen}) => {
  if (!team || !team.formation || !team.startXI) return null;

   const [selectedPlayerId, setSelectedPlayerId] = useState(null);

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

  

   const renderRow = (row, rowIndex) => (
    <div key={rowIndex} className="formation-row">
      {(isAway ? [...row].reverse() : row).map((player, i) => (
        <div key={i} className="player" onClick={() => setSelectedPlayerId({ id: player.id, number: player.number })}>
          {player.number}. {player.name}
          {goalCounts.has(player.id) && (
            <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 0, marginRight: -2 }} />
            
          )}
          {subbedOffIds.has(player.id) && (
            <LoopIcon fontSize="small" style={{  height:"14px", marginLeft: -1, marginRight: -2}} />
          )}
        </div>
      ))}
    </div>
  );


   const renderGoalkeeper = (keeper) => (
    <div className="goalkeeper">
      <div className="player" onClick={() => setSelectedPlayerId({ id: keeper.id, number: keeper.number })}>
        {keeper.number} . {keeper.name}
        {goalCounts.has(keeper.id) && (
          <SportsSoccerIcon fontSize="small" style={{ height: "14px", marginLeft: 0 }} />
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
              onClick={() => setSelectedPlayerId({ id: sub.player.id, number: sub.player.number })}
            >
              {sub.player.number}. {sub.player.name}
              
              {subbedOnIds.has(sub.player.id) && (
                <LoopIcon fontSize="small" style={{ height:"12px" }} />
              )}
{goalCounts.has(sub.player.id) &&
  Array.from({ length: goalCounts.get(sub.player.id) }).map((_, idx) => (
    <SportsSoccerIcon
      key={idx}
      fontSize="small"
      style={{ height: "12px", marginLeft:"-6px"}}
    />
  ))}
              
            </div>
          ))}
        </div>
      )}

       <PlayerModal
  playerId={selectedPlayerId?.id}
  squadNumber={selectedPlayerId?.number}
  isOpen={!!selectedPlayerId}
  onClose={() => setSelectedPlayerId(null)}
/>
    </div> 
  );
};

export default Lineup;

import "./Lineup.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from '@mui/icons-material/Loop';
import PlayerModal from "../PlayerModal/PlayerModal";

const Lineup = ({ team, color, isAway, goalCounts = new Map(), substitutes = [], substitutions = [] , isOpen, isFallback = false,}) => {
  if (!team || !team.formation || !team.startXI) return null;

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [playerPhotos, setPlayerPhotos] = useState({}); // id → photo URL
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const allPlayers = [
    ...team.startXI.map((p) => p.player),
    ...substitutes.map((s) => s.player),
  ];

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

    useEffect(() => {
  if (!allPlayers.length) return;

  const fetchPlayerPhotos = async () => {
    setLoadingPhotos(true);
    const photosMap = {};

    for (const player of allPlayers) {
      try {
        const res = await axios.get("https://v3.football.api-sports.io/players", {
          headers: {
            "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
          },
          params: {
            id: player.id,
            season: "2024",
          },
        });
        if (res.data.response && res.data.response.length > 0) {
          photosMap[player.id] = res.data.response[0].player.photo;
          setPlayerPhotos((prev) => ({ ...prev, [player.id]: res.data.response[0].player.photo }));
        }
      } catch (error) {
        console.error(`Failed to fetch photo for player ${player.id}`, error);
      }
    }

    setLoadingPhotos(false);
  };

  fetchPlayerPhotos();
}, [team.startXI, substitutes]);

  

   const renderRow = (row, rowIndex) => (
    <div key={rowIndex} className="formation-row">
      {(isAway ? [...row].reverse() : row).map((player, i) => (
        <div key={i} className="player" onClick={() => setSelectedPlayerId({ id: player.id, number: player.number })}>
          {playerPhotos[player.id] ? (
            <img
              src={playerPhotos[player.id]}
              alt={player.name}
              className="player-photo-small"
              style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 6 }}
            />
          ) : (
            <div className="player-photo-placeholder" />
          )}
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
         {playerPhotos[keeper.id] ? (
          <img
            src={playerPhotos[keeper.id]}
            alt={keeper.name}
            className="player-photo-small"
            style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 6 }}
          />
        ) : (
          <div className="player-photo-placeholder" />
        )}
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
        <div className={`formation-container ${isAway ? "away-corner" : "home-corner"}`}>
          {!isAway && isFallback && (
            <div className="fallback-lineup-label">Last lineup</div>
          )}
          <div className="formation-display">{team.formation}</div>
          {isAway && isFallback && (
            <div className="fallback-lineup-label">Last lineup</div>
          )}
        </div>
        {!isAway && renderGoalkeeper(orderedGoalkeeper)}
        {orderedRows.map(renderRow)}
        {isAway && renderGoalkeeper(orderedGoalkeeper)}
      </div>

      {substitutes.length > 0 && (
        <div className="substitutes-box">
          <h4>Substitutes</h4>
          {[...substitutes]
  .sort((a, b) => (b.player.pos === "G") - (a.player.pos === "G"))
  .map((sub, i) => (
            
            <div
              key={i}
              className="player-substitute"
              onClick={() => setSelectedPlayerId({ id: sub.player.id, number: sub.player.number })}
            >
              {playerPhotos[sub.player.id] ? (
  <img
    src={playerPhotos[sub.player.id]}
    alt={sub.player.name}
    className="player-photo-small"
    style={{ width: 20, height: 20, borderRadius: "50%", marginRight: 6 }}
  />
) : (
  <div className="player-photo-placeholder" />
)}
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

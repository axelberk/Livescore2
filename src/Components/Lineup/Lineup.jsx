import "./Lineup.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import PlayerModal from "../PlayerModal/PlayerModal";

const Lineup = ({
  team,
  color,
  isAway,
  goalCounts = new Map(),
  substitutions = [],
  isFallback = false,
    playerPhotos = {}, 
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  // const [playerPhotos, setPlayerPhotos] = useState({});
  // const [loadingPhotos, setLoadingPhotos] = useState(false);

  if (!team) {
    return <div>No team data available</div>;
  }

  if (!team.startXI || team.startXI.length === 0) {
    return <div>No starting lineup available for {team.team?.name}</div>;
  }

  const allPlayers = [
    ...team.startXI.map((p) => p.player),
    ...(team.substitutes || []).map((s) => s.player),
  ];

  const subbedOffIds = new Set(
    substitutions.map((subs) => subs.player_out?.id).filter(Boolean)
  );
  const subbedOnIds = new Set(
    substitutions.map((subs) => subs.player_in?.id).filter(Boolean)
  );

  const getFormationGroups = (players, formation) => {
    if (!formation) {
      formation = "4-4-2";
    }
    const formationArray = formation.split("-").map(Number);
    const goalkeeper = players[0]?.player;
    let index = 1;
    const rows = formationArray.map((count) => {
      const group = players.slice(index, index + count).map((p) => p.player);
      index += count;
      return group;
    });
    return { goalkeeper, rows };
  };

  const formation = team.formation || "4-4-2"; // fallback
  const { goalkeeper, rows } = getFormationGroups(team.startXI, formation);
 const orderedGoalkeeper = isAway ? null : goalkeeper;
const orderedRows = isAway ? [...rows].reverse() : rows;
const bottomGoalkeeper = isAway ? goalkeeper : null;

  // useEffect(() => {
  //   if (!allPlayers.length) return;

  //   const fetchPlayerPhotos = async () => {
  //     setLoadingPhotos(true);

  //     for (const player of allPlayers) {
  //       if (playerPhotos[player.id]) continue; 
  //       try {
  //         const res = await axios.get(
  //           "https://v3.football.api-sports.io/players",
  //           {
  //             headers: {
  //               "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
  //             },
  //             params: {
  //               id: player.id,
  //               season: "2024",
  //             },
  //           }
  //         );
  //         if (res.data.response && res.data.response.length > 0) {
  //           setPlayerPhotos((prev) => ({
  //             ...prev,
  //             [player.id]: res.data.response[0].player.photo,
  //           }));
  //         }
  //       } catch (error) {
  //         console.error(`Failed to fetch photo for player ${player.id}`, error);
  //       }
  //     }

  //     setLoadingPhotos(false);
  //   };

  //   fetchPlayerPhotos();
  // }, [allPlayers]);

  const renderRow = (row, rowIndex) => (
    <div key={rowIndex} className="formation-row">
      {(isAway ? [...row].reverse() : row).map((player, i) => (
        <div
          key={i}
          className="player"
          onClick={() =>
            setSelectedPlayerId({ id: player.id, number: player.number })
          }
        >
          {playerPhotos[player.id] ? (
            <img
              src={playerPhotos[player.id]}
              alt={player.name}
              className="player-photo-s"
            />
          ) : (
            <div className="player-photo-placeholder" />
          )}
          <div className="player-text">
            {player.number}. {player.name}
            {goalCounts.has(player.id) && (
              <SportsSoccerIcon
                fontSize="small"
                style={{ height: "14px", marginLeft: 3 }}
              />
            )}
            {subbedOffIds.has(player.id) && (
              <LoopIcon
                fontSize="small"
                style={{ height: "14px", marginLeft: 0}}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGoalkeeper = (keeper) => (
    <div className="goalkeeper">
      <div
        className="player"
        onClick={() =>
          setSelectedPlayerId({ id: keeper.id, number: keeper.number })
        }
      >
        {playerPhotos[keeper.id] ? (
          <img
            src={playerPhotos[keeper.id]}
            alt={keeper.name}
            className="player-photo-s"
          />
        ) : (
          <div className="player-photo-placeholder" />
        )}
        <div className="player-text">
          {keeper.number}. {keeper.name}
          {goalCounts.has(keeper.id) && (
            <SportsSoccerIcon
              fontSize="small"
              style={{ height: "14px", marginLeft: 4 }}
            />
          )}
        </div>
      </div>
    </div>
  );

 return (
  <div className="pitch-container">
  <div className="pitch-half">
    <div
            className={`formation-container ${
              isAway ? "away-corner" : "home-corner"
            }`}
          >
            {!isAway && isFallback && (
              <div className="fallback-lineup-label">Last lineup</div>
            )}
            <div className="formation-display">
              {team.formation || "4-4-2 (formation unavailable)"}
            </div>
            {isAway && isFallback && (
              <div className="fallback-lineup-label">Last lineup</div>
            )}
          </div>
  <div className="lineup-container">
    <div className="formation" style={{ borderColor: color }}>
      {orderedGoalkeeper && renderGoalkeeper(orderedGoalkeeper)}
      {orderedRows.map((row, idx) => renderRow(row, idx))}
      {bottomGoalkeeper && renderGoalkeeper(bottomGoalkeeper)}
    </div>

    <PlayerModal
      playerId={selectedPlayerId?.id}
      squadNumber={selectedPlayerId?.number}
      isOpen={!!selectedPlayerId}
      onClose={() => setSelectedPlayerId(null)}
    />
  </div>
  </div>
  </div>
);
};

export default Lineup;

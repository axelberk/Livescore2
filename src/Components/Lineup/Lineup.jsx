import "./Lineup.css";
import { useState } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import PlayerModal from "../PlayerModal/PlayerModal";
import formationsPositions from "../../../utils/formations";

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

  if (!team) {
    return <div>No team data available</div>;
  }

  if (!team.startXI || team.startXI.length === 0) {
    return <div>No starting lineup available for {team.team?.name}</div>;
  }

  const subbedOffIds = new Set(
    substitutions.map((subs) => subs.player_out?.id).filter(Boolean)
  );

  const formation = team.formation || "4-4-2";
  const positions =
    formationsPositions[formation] || formationsPositions["4-4-2"];

  const renderPlayer = (player, position, index) => {
    const adjustedPosition = !isAway
      ? { x: position.x, y: 100 - position.y }
      : position;

    return (
      <div
        key={player.id}
        className="positioned-player"
        style={{
          left: `${adjustedPosition.x}%`,
          top: `${adjustedPosition.y}%`,
        }}
        onClick={() =>
          setSelectedPlayerId({ id: player.id, number: player.number })
        }
      >
        {playerPhotos[player.id] ? (
          <img
            src={playerPhotos[player.id]}
            alt={player.name}
            className="player-photo-positioned"
          />
        ) : (
          <div className="player-photo-placeholder-positioned" />
        )}
        <div className="player-text-positioned">
          <span className="player-number">
            {player.number}
            {". "}
            {player.name}
          </span>

          <div className="player-icons">
            {goalCounts.has(player.id) && (
              <div className="goal-icon-wrapper">
                <SportsSoccerIcon fontSize="small" className="goal-icon" />
                {goalCounts.get(player.id) > 1 && (
                  <span className="goal-count">
                    {goalCounts.get(player.id)}
                  </span>
                )}
              </div>
            )}
            {subbedOffIds.has(player.id) && (
              <LoopIcon fontSize="small" className="sub-icon" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pitch-container">
      <div className="pitch-markings">
        <div className="penalty-area home-penalty"></div>
        <div className="penalty-area away-penalty"></div>
        <div className="halfway-line"></div>
      </div>

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
          <div className="formation-positioned" style={{ borderColor: color }}>
            {team.startXI.map((playerObj, index) =>
              renderPlayer(playerObj.player, positions[index], index)
            )}
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

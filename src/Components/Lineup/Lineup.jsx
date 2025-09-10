import "./Lineup.css";
import { useState, useEffect } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LoopIcon from "@mui/icons-material/Loop";
import PlayerModal from "../PlayerModal/PlayerModal";
import formationsPositions from "../../../utils/formations";
import { motion } from "motion/react";

const Lineup = ({
  team,
  color,
  isAway,
  goalCounts = new Map(),
  substitutions = [],
  isFallback = false,
  playerPhotos = {},
  redCards = [],
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const redCardIds = new Set(redCards.map((card) => card.player?.id));
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    if (!team?.startXI) return;

    const imagePromises = team.startXI.map((playerObj) => {
      const photoUrl = playerPhotos[playerObj.player.id];
      if (!photoUrl) return Promise.resolve(); 

      return new Promise((resolve) => {
        const img = new Image();
        img.src = photoUrl;

        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
    });

    Promise.all(imagePromises).then(() => {
      setAllImagesLoaded(true);
    });
  }, [team, playerPhotos]);

  if (!allImagesLoaded) {
    return <div className="loading-lineup">Loading lineup...</div>;
  }

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
    const adjustedPosition = isAway
      ? { x: 100 - position.x, y: position.y }
      : { x: position.x, y: 100 - position.y };
    const gotRedCard = redCardIds.has(player.id);

    const goalData = goalCounts.get(player.id) || {};
    const goals = goalData.goals || 0;
    const ownGoals = goalData.ownGoals || 0;

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
        <div className="player-photo-wrapper">
          {playerPhotos[player.id] ? (
            <img
              src={playerPhotos[player.id]}
              alt={player.name}
              className="player-photo-positioned"
              loading="lazy"
            />
          ) : (
            <div className="player-photo-placeholder-positioned" />
          )}

          {goals > 0 && (
            <div className="goal-icon-wrapper">
              {/* <img src="/foot-ball.png" alt="" /> */}
              <SportsSoccerIcon fontSize="small" className="goal-icon" />
              {/* ⚽ */}
              {goals > 1 && <div className="goal-count">{goals}</div>}
            </div>
          )}

          {ownGoals > 0 && (
            <div className="own-goal-icon-wrapper">
              <SportsSoccerIcon fontSize="small" className="own-goal-icon" />
              {ownGoals > 1 && <div className="goal-count">{ownGoals}</div>}
            </div>
          )}

          {subbedOffIds.has(player.id) && (
            <div className="sub-icon-wrapper">
              <LoopIcon fontSize="small" className="sub-off-icon" />
            </div>
          )}
          {gotRedCard && (
            <div className="red-card-icon-wrapper">
              <img src="/Red_card.svg" alt="" className="individual-logo" />
            </div>
          )}
        </div>

        <div className="player-text-positioned">
          <span className="player-number">
            {player.number}. <span className="full-name">{player.name}</span>
            <span className="last-name-only">
              {player.name.split(" ").slice(-1).join(" ")}
            </span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="pitch-container"
    >
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
            <div className="fallback-lineup-label">Last used lineup</div>
          )}
          <div className="formation-display">
            {team.formation || "Formation unavailable"}
          </div>
          {isAway && isFallback && (
            <div className="fallback-lineup-label">Last used lineup</div>
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
    </motion.div>
  );
};

export default Lineup;
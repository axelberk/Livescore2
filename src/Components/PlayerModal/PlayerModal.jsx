import "./PlayerModal.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { Skeleton, Box } from "@mui/material";

const ModalSkeleton = () => (
  <Box
    className="modal-skeleton"
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    padding={0}
  >
    <Skeleton variant="rectangular" width={100} height={100} />
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} variant="text" width="40%" height={15} />
    ))}
  </Box>
);

const PlayerModal = ({ playerId, isOpen, onClose, team, squadNumber }) => {
  const [closing, setClosing] = useState(false);
  const [player, setPlayer] = useState(null);
  const numberFromLineup = squadNumber;
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

  const bestStats = player?.statistics?.reduce((best, current) => {
    const bestApps = best?.games?.appearences ?? 0;
    const currentApps = current?.games?.appearences ?? 0;
    return currentApps > bestApps ? current : best;
  }, null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen || !playerId) return null;

  if (!loading && !player) {
    return (
      <>
        <div className="modal-overlay" onClick={onClose} />
        <div className="player-modal">
          <div className="modal-header">
            <h2 className="modal-name">Player data not available.</h2>
            <button onClick={onClose} className="close-button">
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className={`player-modal${closing ? " closing" : ""}`}>
        <div className="button-header">
         <div className="hidden">Invisible</div>
          <button onClick={handleClose} className="close-button">
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="modal-header">
          {player?.player?.photo && !loading && (
            <img
              src={player.player.photo}
              alt={player.player.name}
              className="player-photo-lg"
            />
          )}

          <div className="modal-club-info">
            {player?.statistics?.[0]?.team ? (
              <Link
  to={`/team/${bestStats?.team?.id}`}
  className="modal-club"
  onClick={handleClose}
>
                <img
                  src={bestStats?.team?.logo}
                  alt={bestStats?.team?.name}
                  className="modal-club-logo"
                  title={bestStats?.team?.name}
                />
              </Link>
            ) : (
              <span className="fact-span">N/A</span>
            )}
          </div>
        </div>
        <div className="modal-content">
          {loading ? (
            <ModalSkeleton />
          ) : !player || !player.player ? (
            <p>Player data not available.</p>
          ) : (
            <>
            <h2 className="modal-name">
            {/* {player?.player
              ? (() => {
                  const number =
                    player?.statistics?.[0]?.games?.number ??
                    player?.player?.number ??
                    numberFromLineup;

                  return `${number ? number + ". " : ""}${
                    player.player.firstname
                  } ${player.player.lastname}`;
                })()
              : "Loading..."} */}
              {player.player.firstname} {player.player.lastname}
          </h2>
              <div className="modal-facts-container">
                
                <div className="modal-facts">
                   
                  <p>
                    Date of birth:{" "}
                    <span className="fact-span">
                      {player.player.birth.date} ({player.player.age} years)
                    </span>
                  </p>
                  <p>
                    Position:{" "}
                    <span className="fact-span">
                      {bestStats?.games?.position || "Unknown"}
                    </span>
                  </p>
                  <p>
                    Height:{" "}
                    <span className="fact-span">
                      {player.player.height || "N/A"}
                    </span>
                  </p>
                  <p>
                    Weight:{" "}
                    <span className="fact-span">
                      {player.player.weight || "N/A"}
                    </span>
                  </p>

                  <p>
                    Nationality:{" "}
                    <span className="fact-span">
                      {player.player.nationality || "N/A"}
                    </span>
                  </p>
                </div>

                <div className="modal-facts">
                  <p>
                    Appearances:{" "}
                    <span className="fact-span">
                      {bestStats?.games?.appearences ?? 0}
                    </span>
                  </p>
                  {bestStats?.games?.position === "Goalkeeper" ? (
                    <p>
                      Goals Conceded:{" "}
                      <span className="fact-span">
                        {bestStats?.goals?.conceded ?? 0}
                      </span>
                    </p>
                  ) : (
                    <>
                      <p>
                        Goals:{" "}
                        <span className="fact-span">
                          {bestStats?.goals?.total ?? 0}
                        </span>
                      </p>
                      <p>
                        Assists:{" "}
                        <span className="fact-span">
                          {bestStats?.goals?.assists ?? 0}
                        </span>
                      </p>
                    </>
                  )}
                  <p>
                    Yellow Cards:{" "}
                    <span className="fact-span">
                      {bestStats?.cards?.yellow ?? 0}
                    </span>
                  </p>
                  <p>
                    Red Cards:{" "}
                    <span className="fact-span">
                      {bestStats?.cards?.red ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerModal;

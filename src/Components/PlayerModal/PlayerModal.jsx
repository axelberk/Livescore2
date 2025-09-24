import "./PlayerModal.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { Skeleton, Box } from "@mui/material";
import { motion } from "framer-motion";

const ModalSkeleton = () => (
  <Box
    className="modal-skeleton"
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    padding={0}
  >
    <Box display="flex" flexDirection="row" gap="8rem">
      <Skeleton variant="rectangular" width={100} height={100} />
      <Skeleton variant="rectangular" width={100} height={100} />
    </Box>
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
      setLoading(true);

      try {
        const currentRes = await axios.get(
          "https://v3.football.api-sports.io/players",
          {
            headers: {
              "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
            },
            params: {
              id: playerId,
              season: "2025",
            },
          }
        );

        const currentPlayerData = currentRes.data.response[0];
        if (!currentPlayerData) {
          setPlayer(null);
          setLoading(false);
          return;
        }

        const currentClubStats = currentPlayerData.statistics?.filter(
          (s) => s.team?.national !== true
        ) || [];

        const domesticLeagueIds = [
          39,  // Premier League
          140, // La Liga
          135, // Serie A
          78,  // Bundesliga
          61,  // Ligue 1
          94,  // Primeira Liga
          88,  // Eredivisie
          203, // Super Lig
          144, // Belgian Pro League
          179, // Scottish Premiership
          218, // Russian Premier League
          253, // A-League
          262, // MLS 
          71,  // Championship
          72,  // League One
          73,  // League Two
        ];

       
        const domesticLeagueStats = currentClubStats.filter(stat => 
          domesticLeagueIds.includes(stat.league?.id)
        );

        const leagueStats = currentClubStats.filter(stat => 
          stat.league?.type === 'League' || 
          (stat.league?.name && !stat.league.name.toLowerCase().includes('cup') && 
           !stat.league.name.toLowerCase().includes('champions') &&
           !stat.league.name.toLowerCase().includes('europa') &&
           !stat.league.name.toLowerCase().includes('conference'))
        );

        const prioritizedStats = domesticLeagueStats.length > 0 
          ? domesticLeagueStats 
          : leagueStats.length > 0 
            ? leagueStats 
            : currentClubStats;

        let currentClubTeam = null;
      if (prioritizedStats.length === 0 || !prioritizedStats.some(stat => stat.team)) {
          try {
            const allTimeRes = await axios.get(
              "https://v3.football.api-sports.io/players",
              {
                headers: {
                  "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY,
                },
                params: {
                  id: playerId,
                },
              }
            );

            const allTimeData = allTimeRes.data.response[0];
            const allClubStats = allTimeData?.statistics?.filter(
              (s) => s.team?.national !== true
            ) || [];

            if (allClubStats.length > 0) {
              currentClubTeam = allClubStats.reduce((latest, current) => {
                const latestSeason = parseInt(latest?.league?.season || 0);
                const currentSeason = parseInt(current?.league?.season || 0);
                return currentSeason > latestSeason ? current : latest;
              }).team;
            }
          } catch (err) {
            console.error("Error fetching all-time player data", err);
          }
        }

        setPlayer({
          ...currentPlayerData,
          statistics: prioritizedStats,
          currentClubTeam: currentClubTeam
        });

      } catch (err) {
        console.error("Error fetching player data", err);
        setPlayer(null);
      }

      setLoading(false);
    };

    fetchPlayer();
  }, [playerId, isOpen]);

  const bestStats = player?.statistics?.length > 0 
    ? player.statistics.reduce((best, current) => {
        const bestApps = best?.games?.appearences ?? 0;
        const currentApps = current?.games?.appearences ?? 0;
        return currentApps > bestApps ? current : best;
      }, null)
    : player?.currentClubTeam 
      ? { 
          team: player.currentClubTeam, 
          games: { appearences: 0, position: "N/A" }, 
          goals: { total: 0, assists: 0, conceded: 0 }, 
          cards: { yellow: 0, red: 0 } 
        }
      : null;

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`player-modal${closing ? " closing" : ""}`}
      >
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
            {loading ? (
              <Skeleton />
            ) : bestStats?.team ? (
              <Link
                to={`/team/${bestStats.team.id}`}
                className="modal-club"
                onClick={handleClose}
              >
                <img
                  src={bestStats.team.logo}
                  alt={bestStats.team.name}
                  className="modal-club-logo"
                  title={bestStats.team.name}
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
              <div className="modal-facts-container">
                <div className="modal-facts-left">
                  <h2 className="modal-name">
                    {player.player.firstname} {player.player.lastname}
                  </h2>
                  <p>
                    Date of birth:{" "}
                    <span className="fact-span">
                      {player.player.birth.date} {/* ({player.player.age} years) */}
                    </span>
                  </p>
                  <p>
                    Position:{" "}
                    <span className="fact-span">
                      {bestStats?.games?.position || "N/A"}
                    </span>
                  </p>
                  <p>
                    Height:{" "}
                    <span className="fact-span">
                      {player.player.height || "N/A"} cm
                    </span>
                  </p>
                  <p>
                    Weight:{" "}
                    <span className="fact-span">
                      {player.player.weight || "N/A"} kg
                    </span>
                  </p>

                  <p>
                    Nationality:{" "}
                    <span className="fact-span">
                      {player.player.nationality || "N/A"}
                    </span>
                  </p>
                </div>

                <div className="modal-facts-right">
                  <h2 className="modal-name">2025-26</h2>
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
      </motion.div>
    </>
  );
};

export default PlayerModal;

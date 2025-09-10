import { useState, useEffect } from "react";
import axios from "axios";

export const useLeagueData = (leagueId) => {
  const [league, setLeague] = useState(null);
  const [seasonLabel, setSeasonLabel] = useState("");
  const [currentSeason, setCurrentSeason] = useState(null);
  const [standings, setStandings] = useState([]);
  const [bracketData, setBracketData] = useState([]);
  const [qualificationFixtures, setQualificationFixtures] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [redCards, setRedCards] = useState([]);
  const [seasonYear, setSeasonYear] = useState(null);

  const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

  // --- Fetch league info & current season ---
  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const res = await axios.get("https://v3.football.api-sports.io/leagues", {
          headers: { "x-apisports-key": API_KEY },
          params: { id: leagueId },
        });
        const leagueData = res.data.response[0];
        setLeague(leagueData);

        const currentSeasonObj = leagueData.seasons.find((s) => s.current);
        setCurrentSeason(currentSeasonObj);
        setSeasonYear(currentSeasonObj?.year);

        // Compute season label
        if (currentSeasonObj?.start && currentSeasonObj?.end) {
          const startYear = new Date(currentSeasonObj.start).getFullYear();
          const endYear = new Date(currentSeasonObj.end).getFullYear();
          const label = startYear === endYear
            ? `${startYear}`
            : `${startYear}-${String(endYear).slice(-2)}`;
          setSeasonLabel(label);
        }
      } catch (err) {
        console.error("Failed to fetch league info:", err);
      }
    };

    fetchLeague();
  }, [leagueId]);

  // --- Fetch standings, top scorers, assists, red cards ---
  useEffect(() => {
    if (!seasonYear) return;

    const fetchDetails = async () => {
      try {
        const [standingsRes, scorersRes, assistsRes, redCardsRes] =
          await Promise.all([
            axios.get("https://v3.football.api-sports.io/standings", {
              headers: { "x-apisports-key": API_KEY },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topscorers", {
              headers: { "x-apisports-key": API_KEY },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topassists", {
              headers: { "x-apisports-key": API_KEY },
              params: { league: leagueId, season: seasonYear },
            }),
            axios.get("https://v3.football.api-sports.io/players/topredcards", {
              headers: { "x-apisports-key": API_KEY },
              params: { league: leagueId, season: seasonYear },
            }),
          ]);

        setStandings(standingsRes.data.response[0]?.league?.standings || []);
        setTopScorers(scorersRes.data.response || []);
        setTopAssists(assistsRes.data.response || []);
        setRedCards(redCardsRes.data.response || []);
      } catch (err) {
        console.error("Failed to fetch standings or stats:", err);
      }
    };

    fetchDetails();
  }, [seasonYear, leagueId]);

  // --- Fetch fixtures for bracket & qualification ---
  useEffect(() => {
    if (!seasonYear) return;

    const fetchFixtures = async () => {
      try {
        const res = await axios.get("https://v3.football.api-sports.io/fixtures", {
          headers: { "x-apisports-key": API_KEY },
          params: { league: leagueId, season: seasonYear },
        });

        const fixtures = res.data.response;

        // Bracket (playoffs/knockout)
        const knockoutMatches = fixtures.filter(
          (f) => (f.league.round?.toLowerCase().includes("round") || f.league.round?.toLowerCase().includes("final"))
        );
        setBracketData(knockoutMatches);

        // Qualification rounds
        const qualification = fixtures.filter((f) => {
          const round = f.league.round?.toLowerCase() || "";
          return (round.includes("qualifying") || round.includes("play-off")) && !round.includes("knockout");
        });
        setQualificationFixtures(qualification);
      } catch (err) {
        console.error("Failed to fetch fixtures:", err);
      }
    };

    fetchFixtures();
  }, [seasonYear, leagueId]);

  return {
    league,
    seasonLabel,
    currentSeason,
    standings,
    bracketData,
    qualificationFixtures,
    topScorers,
    topAssists,
    redCards,
  };
};

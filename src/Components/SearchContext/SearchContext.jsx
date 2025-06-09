import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    players: [],
    teams: [],
    leagues: [],
  });

 const performSearch = async (query) => {
  console.log('Performing search for:', query);
  if (!query) {
    setSearchResults({ players: [], teams: [], leagues: [] });
    return;
  }

  try {
    const [playersRes, teamsRes, leaguesRes] = await Promise.all([
      axios.get('https://v3.football.api-sports.io/players', {
        headers: {
          'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY,
        },
        params: { search: query, season: 2024, league: 39 },
      }),
      axios.get('https://v3.football.api-sports.io/teams', {
        headers: {
          'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY,
        },
        params: { search: query },
      }),
      axios.get('https://v3.football.api-sports.io/leagues', {
        headers: {
          'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY,
        },
        params: { search: query },
      }),
    ]);

    console.log('Results:', {
      players: playersRes.data.response,
      teams: teamsRes.data.response,
      leagues: leaguesRes.data.response,
    });

   console.log('Players response raw:', playersRes.data);

    setSearchResults({
      players: playersRes.data.response,
      teams: teamsRes.data.response,
      leagues: leaguesRes.data.response,
    });
  } catch (err) {
    console.error('Search failed:', err);
  }
};


  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, searchResults, performSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);

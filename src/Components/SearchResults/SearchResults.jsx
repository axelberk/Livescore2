import { useSearch } from '../SearchContext/SearchContext';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';

const SearchResults = () => {
  const { searchResults } = useSearch();
  const { players, teams, leagues } = searchResults;

  if (
    players.length === 0 &&
    teams.length === 0 &&
    leagues.length === 0
  ) {
    return <p>No results found.</p>;
  }

  return (
    <>
      {players.length > 0 && (
        <div>
          <h3>Players</h3>
          {players.map((p) => (
            <Link key={p.player.id} to={`/player/${p.player.id}`}>
              <p>{p.player.name}</p>
            </Link>
          ))}
        </div>
      )}
      {teams.length > 0 && (
        <div>
          <h3>Teams</h3>
          {teams.map((t) => (
            <Link key={t.team.id} to={`/team/${t.team.id}`}>
              <p>{t.team.name}</p>
            </Link>
          ))}
        </div>
      )}
      {leagues.length > 0 && (
        <div>
          <h3>Leagues</h3>
          {leagues.map((l) => (
            <Link key={l.league.id} to={`/league/${l.league.id}`}>
              <p>{l.league.name}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default SearchResults;

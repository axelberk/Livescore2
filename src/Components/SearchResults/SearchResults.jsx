import { useSearch } from "../SearchContext/SearchContext";
import { Link } from "react-router-dom";
import "./SearchResults.css";

const SearchResults = () => {
  const { searchResults } = useSearch();
  const { players, teams, leagues } = searchResults;

  if (players.length === 0 && teams.length === 0 && leagues.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div className="search-results">
      <>
        {players.length > 0 && (
          <div>
            <h3>Players</h3>
            {players.map((p) => (
              <Link
                key={p.player.id}
                to={`/player/${p.player.id}`}
                className="result-list"
              >
                <p>{p.player.name}</p>
              </Link>
            ))}
          </div>
        )}
        {teams.length > 0 && (
          <div>
            <h3>Teams</h3>
            {teams.map((t) => (
              <Link
                key={t.team.id}
                to={`/team/${t.team.id}`}
                className="team-result"
              >
                <img
                  src={t.team.logo}
                  alt={t.team.name}
                  className="team-logo"
                />
                <p>{t.team.name}</p>
              </Link>
            ))}
          </div>
        )}
        {leagues.length > 0 && (
          <div>
            <h3>Leagues & Competitions</h3>
            {leagues.map((l) => (
              <Link
                key={l.league.id}
                to={`/league/${l.league.id}`}
                className="league-result"
              >
                <img
                  src={l.league.logo}
                  alt={l.league.name}
                  className="league-logo"
                />
                <span>{l.league.name}</span>
              </Link>
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default SearchResults;

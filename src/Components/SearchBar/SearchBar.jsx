import { useSearch } from '../SearchContext/SearchContext';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <input
      type="text"
      placeholder="Search teams, players..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
};

export default SearchBar
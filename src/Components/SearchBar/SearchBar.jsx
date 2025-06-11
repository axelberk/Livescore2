import { useSearch } from '../SearchContext/SearchContext';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
      navigate('/search');
    }
  };

  return (
    <input
      type="text"
      placeholder="Search leagues or teams..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      className="search-input"
    />
  );
};

export default SearchBar;

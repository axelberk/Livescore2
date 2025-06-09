import SearchResults from '../SearchResults/SearchResults';
import { useSearch } from '../SearchContext/SearchContext';

const SearchPage = () => {
  const { searchQuery } = useSearch();

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Search Results for "{searchQuery}"</h2>
      <SearchResults />
    </div>
  );
};

export default SearchPage;

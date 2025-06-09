import { useEffect } from 'react';
import { useSearch } from '../SearchContext/SearchContext';
import SearchResults from '../SearchResults/SearchResults';
import Header from '../Header/Header';

const SearchPage = () => {
  const { searchQuery, performSearch } = useSearch();

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div>
      <Header/>
      <h2>Search Results for "{searchQuery}"</h2>
      <SearchResults />
    </div>
  );
};

export default SearchPage;

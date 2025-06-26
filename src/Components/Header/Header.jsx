import "./Header.css"
import SearchBar from "../SearchBar/SearchBar"
import { useSearch } from '../SearchContext/SearchContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
    return (
        <div className="header">
            <a href="/" className="home-button">Home</a>
            <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearch}
        placeholder="🔍Search teams or leagues..."
        className="search-input"
      />
        </div>
    )
}

export default Header
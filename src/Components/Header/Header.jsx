import "./Header.css"
import SearchBar from "../SearchBar/SearchBar"
import { useSearch } from '../SearchContext/SearchContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
    return (
        <div className="header">
            <a href="/" className="home-button">Home</a>
            <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
        placeholder="Search..."
        className="search-input"
      />
        </div>
    )
}

export default Header
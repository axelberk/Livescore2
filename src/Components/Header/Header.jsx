import "./Header.css"
import SearchBar from "../SearchBar/SearchBar"
import { useSearch } from '../SearchContext/SearchContext';
import { useNavigate } from 'react-router-dom';
import { TextField } from "@mui/material";

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
           <TextField
             placeholder="Search..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onKeyDown={handleSearch}
             variant="outlined"
            sx={{backgroundColor:"white"}}
             size="small"
             InputProps={{
               sx: {
                 fontFamily: "inherit",
               
                 "& input::placeholder": {
                   fontSize: "0.85rem",
                   fontFamily: "inherit",
                 },
                 "& fieldset": {
        borderRadius: "inherit",  
      },
               },
             }}
           />
        </div>
    )
}

export default Header
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
      backgroundColor:"transparent",
      fontFamily: "inherit",
      "& input::placeholder": {
        fontSize: "0.8rem",
        fontFamily: "inherit",
      },
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      width: {
        xs: "100px",  
        sm: "140px",  
        md: "200px",  
      },
      height: {
        xs: "26px",  
        sm: "32px",  
        md: "36px"
      },

      fontSize: {
      xs:"0.7rem",
      sm:"0.8rem",
      md:"0.9rem"
      },
      boxSizing: "border-box",
    },
  }}
           />
        </div>
    )
}

export default Header
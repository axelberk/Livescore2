import { useState, useRef, forwardRef } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Calendar.css";
import { useSearch } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const inputRef = useRef(null);

  const goToPreviousDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  return (
    <div className="Calendar">
      <div className="calendar-nav">
        <button className="calendar-arrow" onClick={goToPreviousDay}>
          <ArrowLeftIcon fontSize="large"/>
        </button>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="EEEE, d MMMM yyyy"
          customInput={<CustomInput />}
        />

        <button className="calendar-arrow" onClick={goToNextDay}>
          <ArrowRightIcon fontSize="large"/>
        </button>

        <input
          className="date-clicker"
          type="date"
          ref={inputRef}
          value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          style={{ display: "none" }}
        />
      </div>
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
      
      },
      width: {
        xs: "75px",  
        sm: "140px",  
        md: "200px",  
      },
      height: {
        xs: "28px",  
        sm: "32px",  
        md: "40px"
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
  );
};

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="calendar-date" onClick={onClick} ref={ref}>
    <CalendarMonthIcon className="calendar-icon"/>
    {value}
  </div>
));

export default Calendar;

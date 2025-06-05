import { useState, useRef, forwardRef } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Calendar.css";
import { useSearch } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
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
          <ArrowLeftIcon />
        </button>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="EEEE, d MMMM yyyy"
          customInput={<CustomInput />}
        />

        <button className="calendar-arrow" onClick={goToNextDay}>
          <ArrowRightIcon />
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
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
        placeholder="Search..."
        className="search-input"
      />
    </div>
  );
};

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="calendar-date" onClick={onClick} ref={ref}>
    <CalendarMonthIcon />
    {value}
  </div>
));

export default Calendar;

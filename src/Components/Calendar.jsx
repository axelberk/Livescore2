import { useState } from "react";
import "./Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  
  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const goToPreviousDay = () => {
    setSelectedDate((prevDate) => new Date(prevDate.setDate(prevDate.getDate() - 1)));
  };

  const goToNextDay = () => {
    setSelectedDate((prevDate) => new Date(prevDate.setDate(prevDate.getDate() + 1)));
  };

  return (
    <div className="Calendar">
      <button className="calendar-arrow" onClick={goToPreviousDay}>
        <ArrowLeftIcon />
      </button>
      <a href="#" className="clickable-calendar" onClick={(e) => e.preventDefault()}>
        <CalendarMonthIcon />
        <span>{formatDate(selectedDate)}</span>
      </a>
      <button className="calendar-arrow" onClick={goToNextDay}>
        <ArrowRightIcon />
      </button>
      <input type="date" value={formatDate(selectedDate)} onChange={handleDateChange} />
    </div>
  );
};

export default Calendar;

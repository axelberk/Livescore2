import { useState } from "react";
import "./Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const goToPreviousDay = () => {
    setSelectedDate((prevDate) => new Date(prevDate.getTime() - 24 * 60 * 60 * 1000));
  };

  const goToNextDay = () => {
    setSelectedDate((prevDate) => new Date(prevDate.getTime() + 24 * 60 * 60 * 1000));
  };

  return (
    <div className="Calendar">
      <button className="calendar-arrow" onClick={goToPreviousDay}>
        <ArrowLeftIcon />
      </button>
      <div className="calendar-date">
        {formatDate(selectedDate)}
      </div>
      <button className="calendar-arrow" onClick={goToNextDay}>
        <ArrowRightIcon />
      </button>
      <input type="date" value={formatDate(selectedDate)} onChange={handleDateChange} />
    </div>
  );
};

export default Calendar;

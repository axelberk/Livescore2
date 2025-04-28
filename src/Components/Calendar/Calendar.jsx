import { useState, useRef } from "react";
import "./Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const inputRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const goToPreviousDay = () => {
    setSelectedDate(
      (prevDate) => new Date(prevDate.getTime() - 24 * 60 * 60 * 1000)
    );
  };

  const goToNextDay = () => {
    setSelectedDate(
      (prevDate) => new Date(prevDate.getTime() + 24 * 60 * 60 * 1000)
    );
  };

  const handleDateClick = () => {
  if (inputRef.current) {
    inputRef.current.showPicker?.(); // if browser supports showPicker
    inputRef.current.click(); // fallback
  }
};

  return (
    <div className="Calendar">
      <button className="calendar-arrow" onClick={goToPreviousDay}>
        <ArrowLeftIcon />
      </button>

      <div className="calendar-date" onClick={handleDateClick}>
        <CalendarMonthIcon/>
        {formatDate(selectedDate)}
      </div>

      <button className="calendar-arrow" onClick={goToNextDay}>
        <ArrowRightIcon />
      </button>

      <input
      className="date-clicker"
        type="date"
        ref={inputRef}
        value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
        onChange={handleDateChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Calendar;

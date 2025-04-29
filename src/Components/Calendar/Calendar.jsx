import { useState, useRef, forwardRef } from "react"; 
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Calendar.css";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const inputRef = useRef(null); 

  const goToPreviousDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  return (
    <div className="Calendar">
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
  );
};

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="calendar-date" onClick={onClick} ref={ref}>
    <CalendarMonthIcon/>
    {value}
  </div>
));

export default Calendar;

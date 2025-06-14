import React from "react";

const FootballPitch = () => {
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="auto"
      style={{ maxWidth: "600px", border: "2px solid green", background: "#0b6623" }}
    >
      {/* Outer pitch */}
      <rect x="0" y="0" width="600" height="900" fill="#0b6623" stroke="white" strokeWidth="4" />

      {/* Center line */}
      <line x1="0" y1="450" x2="600" y2="450" stroke="white" strokeWidth="4" />

      {/* Center circle */}
      <circle cx="300" cy="450" r="73" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="300" cy="450" r="2" fill="white" />

      {/* Penalty areas */}
      {/* Top */}
      <rect x="150" y="0" width="300" height="130" stroke="white" strokeWidth="4" fill="none" />
      <rect x="220" y="0" width="160" height="50" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="300" cy="100" r="2" fill="white" />
      <path d="M260,130 A40,40 0 0,1 340,130" stroke="white" strokeWidth="4" fill="none" />

      {/* Bottom */}
      <rect x="150" y="770" width="300" height="130" stroke="white" strokeWidth="4" fill="none" />
      <rect x="220" y="850" width="160" height="50" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="300" cy="800" r="2" fill="white" />
      <path d="M260,770 A40,40 0 0,0 340,770" stroke="white" strokeWidth="4" fill="none" />

      {/* Corner arcs */}
      <path d="M0,0 A10,10 0 0,1 10,10" stroke="white" strokeWidth="3" fill="none" />
      <path d="M600,0 A10,10 0 0,0 590,10" stroke="white" strokeWidth="3" fill="none" />
      <path d="M0,900 A10,10 0 0,0 10,890" stroke="white" strokeWidth="3" fill="none" />
      <path d="M600,900 A10,10 0 0,1 590,890" stroke="white" strokeWidth="3" fill="none" />
    </svg>
  );
};

export default FootballPitch;


const formationsPositions = {
  "4-4-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 13, y: 70 }, // Left back
    { x: 35, y: 70 }, // Left center back
    { x: 65, y: 70 }, // Right center back
    { x: 87, y: 70 }, // Right back
    { x: 15, y: 40 }, // Left midfielder
    { x: 40, y: 40 }, // Left center midfielder
    { x: 65, y: 40 }, // Right center midfielder
    { x: 89, y: 40 }, // Right midfielder
    { x: 35, y: 15 }, // Left forward
    { x: 65, y: 15 }, // Right forward
  ],
  "3-5-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 25, y: 75 }, // Left CB
    { x: 50, y: 75 }, // Center CB
    { x: 75, y: 75 }, // Right CB
    { x: 15, y: 55 }, // Left midfielder
    { x: 35, y: 55 }, // Left center midfielder
    { x: 50, y: 55 }, // Center midfielder
    { x: 65, y: 55 }, // Right center midfielder
    { x: 85, y: 55 }, // Right midfielder
    { x: 35, y: 30 }, // Left forward
    { x: 65, y: 30 }, // Right forward
  ],
  "4-3-3": [
    { x: 50, y: 90 }, // Goalkeeper
  { x: 11, y: 70 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 89, y: 70 }, // DEF
  { x: 25, y: 45 }, { x: 50, y: 45 }, { x: 75, y: 45 }, // MID
  { x: 15, y: 20 }, { x: 50, y: 20 }, { x: 85, y: 20 }, // FWD
  ],
  "4-2-3-1": [
  { x: 50, y: 90 }, // Goalkeeper
  { x: 15, y: 75 }, { x: 35, y: 75 }, { x: 65, y: 75 }, { x: 85, y: 75 }, // DEF
  { x: 35, y: 60 }, { x: 65, y: 60 }, // CDM
  { x: 20, y: 45 }, { x: 50, y: 40 }, { x: 80, y: 45 }, // CAMs / wingers
  { x: 50, y: 20 }, // Striker
],
};

export default formationsPositions;

// import formationsPositions from "../../../utils/formations";
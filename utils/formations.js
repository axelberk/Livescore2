const formationsPositions = {
  "4-4-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 18, y: 70 }, // Left back
    { x: 40, y: 70 }, // Left center back
    { x: 60, y: 70 }, // Right center back
    { x: 82, y: 70 }, // Right back
    { x: 18, y: 40 }, // Left midfielder
    { x: 40, y: 40 }, // Left center midfielder
    { x: 60, y: 40 }, // Right center midfielder
    { x: 82, y: 40 }, // Right midfielder
    { x: 35, y: 15 }, // Left forward
    { x: 65, y: 15 }, // Right forward
  ],
  "3-5-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 25, y: 70 }, // Left CB
    { x: 50, y: 70 }, // Center CB
    { x: 75, y: 70 }, // Right CB
    { x: 16, y: 40 }, // right mid
    { x: 32, y: 40 }, // Left center midfielder
    { x: 50, y: 40 }, // Center midfielder
    { x: 68, y: 40 }, // Right center midfielder
    { x: 84, y: 40 }, // left mid
    { x: 35, y: 10 }, // Left forward
    { x: 65, y: 10 }, // Right forward
  ],
  "4-3-3": [
    { x: 50, y: 90 }, 
    { x: 18, y: 70 },
    { x: 40, y: 70 },
    { x: 60, y: 70 },
    { x: 82, y: 70 },
    { x: 25, y: 40 },
    { x: 50, y: 40 },
    { x: 75, y: 40 },
    { x: 25, y: 14 },
    { x: 50, y: 14 },
    { x: 75, y: 14 },
  ],
  "4-2-3-1": [
    { x: 50, y: 90 },
    { x: 18, y: 70 },
    { x: 40, y: 70 },
    { x: 60, y: 70 },
    { x: 82, y: 70 },
    { x: 35, y: 50 },
    { x: 65, y: 50 },
    { x: 20, y: 30 },
    { x: 50, y: 30 },
    { x: 80, y: 30 },
    { x: 50, y: 10 },
  ],
  "4-3-1-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 18, y: 70 }, // Left back
    { x: 40, y: 70 }, // Left center back
    { x: 60, y: 70 }, // Right center back
    { x: 82, y: 70 }, // Right back
    { x: 25, y: 50 }, // Left midfielder
    { x: 50, y: 50 }, // Left center midfielder
    { x: 75, y: 50 }, // Right center midfielder
    { x: 50, y: 28 }, // cam
    { x: 35, y: 10 }, // Left forward
    { x: 65, y: 10 }, // Right forward
  ],
  "4-1-4-1": [
    { x: 50, y: 90 }, 
    { x: 18, y: 70 },
    { x: 40, y: 70 },
    { x: 60, y: 70 },
    { x: 82, y: 70 }, 
    { x: 50, y: 50 }, 
    { x: 18, y: 30 }, 
    { x: 60, y: 30 }, 
    { x: 40 , y: 30 }, 
    { x: 82 , y: 30 }, 
    { x: 50, y: 10 }, 
  ],
  "3-4-2-1": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 25, y: 70 }, // Left CB
    { x: 50, y: 70 }, // Center CB
    { x: 75, y: 70 }, // Right CB 
    { x: 15, y: 50 }, // left mid
    { x: 38, y: 50 }, // Left cm
    { x: 62, y: 50 }, // right cm
    { x: 85, y: 50 }, // right mid
    { x: 30, y: 30 }, // left cam
    { x: 70, y: 30 }, // right cam
    { x: 50, y: 15 }, // forward
  ],
  "3-4-1-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 25, y: 70 }, // Left CB
    { x: 50, y: 70 }, // Center CB
    { x: 75, y: 70 }, // Right CB 
    { x: 15, y: 50 }, // left mid
    { x: 38, y: 50 }, // Left cm
    { x: 62, y: 50 }, // right cm
    { x: 85, y: 50 }, // right mid
    { x: 50, y: 30 }, //  cam
    { x: 35, y: 10 }, // left forward
    { x: 65, y: 10 }, // right forward
  ],
  "5-4-1": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 15, y: 70 }, // Left back
    { x: 68, y: 70 }, // Left center back
    { x: 50, y: 70 }, // center back
    { x: 32, y: 70 }, // Right center back
    { x: 85, y: 70 }, // left back
    { x: 20, y: 40 }, // right mid
    { x: 40, y: 40 }, // Right center midfielder
    { x: 60, y: 40 }, // lcm
    { x: 80, y: 40 }, // Left mid
    { x: 50, y: 10 }, // CF
  ],
   "4-2-2-2": [
    { x: 50, y: 90 },
    { x: 18, y: 70 },
    { x: 40, y: 70 },
    { x: 60, y: 70 },
    { x: 82, y: 70 },
    { x: 35, y: 50 },
    { x: 65, y: 50 },
    { x: 35, y: 30 },
    { x: 65, y: 30 },
    { x: 35, y: 10 },
    { x: 65, y: 10 },
  ],
  "4-1-2-1-2": [
    { x: 50, y: 90 },
    { x: 18, y: 75 },
    { x: 40, y: 75 },
    { x: 60, y: 75 },
    { x: 82, y: 75 },
    { x: 50, y: 55 },
    { x: 65, y: 40 },
    { x: 35, y: 40 },
    { x: 50, y: 25 },
    { x: 35, y: 10 },
    { x: 65, y: 10 },
  ],
  "4-1-3-2": [
    { x: 50, y: 90 },
    { x: 18, y: 75 },
    { x: 40, y: 75 },
    { x: 60, y: 75 },
    { x: 82, y: 75 },
    { x: 50, y: 55 },
    { x: 75, y: 35 },
    { x: 50, y: 35 },
    { x: 25, y: 35 },
    { x: 35, y: 10 },
    { x: 65, y: 10 },
  ],
  "5-3-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 15, y: 70 }, // Left back
    { x: 68, y: 70 }, // Left center back
    { x: 50, y: 70 }, // center back
    { x: 32, y: 70 }, // Right center back
    { x: 85, y: 70 }, // left back
    { x: 30, y: 40 }, // right mid
    { x: 50, y: 40 }, // Right center midfielder
    { x: 70, y: 40 }, // lcm
    { x: 60, y: 10 }, // Left mid
    { x: 40, y: 10 }, // CF
  ],
  "4-3-2-1": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 18, y: 70 }, // Left back
    { x: 40, y: 70 }, // Left center back
    { x: 60, y: 70 }, // Right center back
    { x: 82, y: 70 }, // Right back
    { x: 25, y: 50 }, // Left midfielder
    { x: 50, y: 50 }, // Left center midfielder
    { x: 75, y: 50 }, // Right center midfielder
    { x: 35, y: 28 }, // cam
    { x: 65, y: 28 }, // Left forward
    { x: 50, y: 10 }, // Right forward
  ],
};

export default formationsPositions;

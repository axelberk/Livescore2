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
    { x: 85, y: 40 }, // Right midfielder
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
    { x: 85, y: 55 }, // Right winger
    { x: 35, y: 30 }, // Left forward
    { x: 65, y: 30 }, // Right winger
  ],
  "4-3-3": [
    { x: 50, y: 90 }, 
    { x: 14, y: 70 },
    { x: 35, y: 70 },
    { x: 65, y: 70 },
    { x: 86, y: 70 },
    { x: 25, y: 45 },
    { x: 50, y: 45 },
    { x: 75, y: 45 },
    { x: 19, y: 14 },
    { x: 50, y: 14 },
    { x: 81, y: 14 },
  ],
  "4-2-3-1": [
    { x: 50, y: 90 },
    { x: 15, y: 75 },
    { x: 35, y: 75 },
    { x: 65, y: 75 },
    { x: 85, y: 75 },
    { x: 35, y: 50 },
    { x: 65, y: 50 },
    { x: 20, y: 30 },
    { x: 50, y: 30 },
    { x: 80, y: 30 },
    { x: 50, y: 10 },
  ],
  "4-3-1-2": [
    { x: 50, y: 90 }, // Goalkeeper
    { x: 13, y: 70 }, // Left back
    { x: 35, y: 70 }, // Left center back
    { x: 65, y: 70 }, // Right center back
    { x: 87, y: 70 }, // Right back
    { x: 25, y: 50 }, // Left midfielder
    { x: 50, y: 50 }, // Left center midfielder
    { x: 75, y: 50 }, // Right center midfielder
    { x: 50, y: 28 }, // cam
    { x: 35, y: 10 }, // Left forward
    { x: 65, y: 10 }, // Right forward
  ],
  "4-1-4-1": [
    { x: 50, y: 90 }, 
    { x: 13, y: 70 }, 
    { x: 35, y: 70 }, 
    { x: 65, y: 70 }, 
    { x: 87, y: 70 }, 
    { x: 15, y: 40 }, 
    { x: 11, y: 40 }, 
    { x: 65, y: 40 }, 
    { x: 35, y: 40 }, 
    { x: 89, y: 40 }, 
    { x: 50, y: 10 }, 
  ],
};

export default formationsPositions;

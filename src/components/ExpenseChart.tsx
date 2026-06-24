import React from 'react';

interface ExpenseChartProps {
  bills: any[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ bills }) => {
  // Chart points for drawing the line wave
  // MON, TUE, WED, THU, FRI, SAT, SUN
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // X coordinates for the 7 days
  const xCoords = [40, 95, 150, 205, 260, 315, 370];
  
  // Calculate start of current week (Monday)
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sun, 1 is Mon, etc.
  const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMon);
  startOfWeek.setHours(0, 0, 0, 0);

  // Group bills by day of current week
  const dailyTotals = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
  
  bills.forEach(bill => {
    const billDate = new Date(bill.dateObject || bill.date);
    const diffTime = billDate.getTime() - startOfWeek.getTime();
    if (diffTime >= 0 && diffTime < 7 * 24 * 60 * 60 * 1000) {
      const dayIndex = billDate.getDay(); // 0 is Sun, 1 is Mon, etc.
      // Map Sun (0) to index 6, and Mon-Sat (1-6) to index 0-5
      const mappedIdx = dayIndex === 0 ? 6 : dayIndex - 1;
      dailyTotals[mappedIdx] += Number(bill.final_price || 0);
    }
  });

  // Scale Y coordinates (base y=170, max height from base is 110px)
  const maxVal = Math.max(...dailyTotals, 100);
  const barY = dailyTotals.map(total => 170 - (total / maxVal) * 110);
  
  // Wave line Y coords follow slightly smoothed curve
  const lineY = dailyTotals.map(total => 170 - (total / maxVal) * 120);
  
  // Generate SVG Path for smooth cubic bezier curves
  let pathD = `M ${xCoords[0]} ${lineY[0]}`;
  for (let i = 0; i < xCoords.length - 1; i++) {
    const x1 = xCoords[i];
    const y1 = lineY[i];
    const x2 = xCoords[i + 1];
    const y2 = lineY[i + 1];
    
    // Control points halfway between x coords
    const cpX1 = x1 + (x2 - x1) / 2;
    const cpY1 = y1;
    const cpX2 = x1 + (x2 - x1) / 2;
    const cpY2 = y2;
    
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
  }

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      <div className="relative w-full h-[220px] flex justify-center items-center">
        <svg 
          viewBox="0 0 410 210" 
          width="100%" 
          height="100%" 
          className="overflow-visible"
        >
          {/* Background Grid Lines */}
          <line x1="20" y1="170" x2="390" y2="170" stroke="#F1F5F9" strokeWidth="1.5" />
          <line x1="20" y1="120" x2="390" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="20" y1="70" x2="390" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />

          {/* Draw Vertical Bars */}
          {xCoords.map((x, i) => {
            const isActive = i === 3; // THU is the highlighted active bar
            return (
              <line
                key={i}
                x1={x}
                y1="170"
                x2={x}
                y2={barY[i]}
                stroke={isActive ? '#0F766E' : '#E2E8F0'}
                strokeWidth={isActive ? '8' : '6'}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Draw Smooth Wave Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#14B8A6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(20,184,166,0.15)]"
          />

          {/* Draw Active Highlight Point on Curve */}
          <circle
            cx={xCoords[3]}
            cy={lineY[3]}
            r="4.5"
            fill="#0F766E"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            className="shadow-sm"
          />

          {/* X Axis Labels */}
          {days.map((day, i) => (
            <text
              key={i}
              x={xCoords[i]}
              y="195"
              textAnchor="middle"
              className="text-[10px] font-semibold text-slate-400 fill-current"
            >
              {day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

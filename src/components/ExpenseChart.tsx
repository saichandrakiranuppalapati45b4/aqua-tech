import React from 'react';

interface ExpenseChartProps {
  bills: any[];
  filterRange: 'week' | 'month' | '3months' | '6months' | 'year' | 'all';
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ bills, filterRange }) => {
  const now = new Date();
  
  let labels: string[] = [];
  let xCoords: number[] = [];
  let values: number[] = [];
  let activePointIndex = -1;

  if (filterRange === 'week') {
    labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    xCoords = [40, 95, 150, 205, 260, 315, 370];
    
    const currentDay = now.getDay();
    activePointIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMon);
    startOfWeek.setHours(0, 0, 0, 0);
    
    values = [0, 0, 0, 0, 0, 0, 0];
    bills.forEach(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      const diffTime = billDate.getTime() - startOfWeek.getTime();
      if (diffTime >= 0 && diffTime < 7 * 24 * 60 * 60 * 1000) {
        const dayIndex = billDate.getDay();
        const mappedIdx = dayIndex === 0 ? 6 : dayIndex - 1;
        values[mappedIdx] += Number(bill.final_price || 0);
      }
    });
  } else if (filterRange === 'month') {
    labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
    xCoords = [40, 122.5, 205, 287.5, 370];
    values = [0, 0, 0, 0, 0];
    
    const dayOfMonth = now.getDate();
    if (dayOfMonth <= 7) activePointIndex = 0;
    else if (dayOfMonth <= 14) activePointIndex = 1;
    else if (dayOfMonth <= 21) activePointIndex = 2;
    else if (dayOfMonth <= 28) activePointIndex = 3;
    else activePointIndex = 4;
    
    bills.forEach(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      if (billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear()) {
        const dateVal = billDate.getDate();
        if (dateVal <= 7) values[0] += Number(bill.final_price || 0);
        else if (dateVal <= 14) values[1] += Number(bill.final_price || 0);
        else if (dateVal <= 21) values[2] += Number(bill.final_price || 0);
        else if (dateVal <= 28) values[3] += Number(bill.final_price || 0);
        else values[4] += Number(bill.final_price || 0);
      }
    });
  } else if (filterRange === '3months') {
    values = [0, 0, 0];
    xCoords = [40, 205, 370];
    activePointIndex = 2;
    
    const months: Date[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase());
    }
    
    bills.forEach(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      for (let i = 0; i < 3; i++) {
        if (billDate.getMonth() === months[i].getMonth() && billDate.getFullYear() === months[i].getFullYear()) {
          values[i] += Number(bill.final_price || 0);
        }
      }
    });
  } else if (filterRange === '6months' || filterRange === 'all') {
    values = [0, 0, 0, 0, 0, 0];
    xCoords = [40, 106, 172, 238, 304, 370];
    activePointIndex = 5;
    
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase());
    }
    
    bills.forEach(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      for (let i = 0; i < 6; i++) {
        if (billDate.getMonth() === months[i].getMonth() && billDate.getFullYear() === months[i].getFullYear()) {
          values[i] += Number(bill.final_price || 0);
        }
      }
    });
  } else if (filterRange === 'year') {
    labels = ['JAN-FEB', 'MAR-APR', 'MAY-JUN', 'JUL-AUG', 'SEP-OCT', 'NOV-DEC'];
    xCoords = [40, 106, 172, 238, 304, 370];
    
    const currentMonth = now.getMonth();
    activePointIndex = Math.floor(currentMonth / 2);
    
    values = [0, 0, 0, 0, 0, 0];
    bills.forEach(bill => {
      const billDate = new Date(bill.dateObject || bill.date);
      if (billDate.getFullYear() === now.getFullYear()) {
        const m = billDate.getMonth();
        const idx = Math.floor(m / 2);
        values[idx] += Number(bill.final_price || 0);
      }
    });
  }

  // Scale Y coordinates (base y=170, max height from base is 110px)
  const maxVal = Math.max(...values, 100);
  const barY = values.map(total => 170 - (total / maxVal) * 110);
  
  // Wave line Y coords follow slightly smoothed curve
  const lineY = values.map(total => 170 - (total / maxVal) * 120);
  
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
            const isActive = i === activePointIndex;
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
          {activePointIndex >= 0 && activePointIndex < xCoords.length && (
            <circle
              cx={xCoords[activePointIndex]}
              cy={lineY[activePointIndex]}
              r="4.5"
              fill="#0F766E"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="shadow-sm"
            />
          )}

          {/* X Axis Labels */}
          {labels.map((label, i) => (
            <text
              key={i}
              x={xCoords[i]}
              y="195"
              textAnchor="middle"
              className="text-[10px] font-semibold text-slate-400 fill-current"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

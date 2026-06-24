import React from 'react';

interface YearlyProjectionChartProps {
  bills: any[];
}

export const YearlyProjectionChart: React.FC<YearlyProjectionChartProps> = ({ bills }) => {
  const months = ['Jan', 'Apr', 'Jul', 'Oct', 'Dec'];
  const monthIndices = [0, 3, 6, 9, 11]; // Jan, Apr, Jul, Oct, Dec
  
  const now = new Date();
  const currentYear = now.getFullYear();

  const monthlySums = monthIndices.map(monthIdx => {
    return bills
      .filter(b => {
        const bd = new Date(b.date);
        return bd.getMonth() === monthIdx && bd.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + Number(b.final_price || 0), 0);
  });

  const maxVal = Math.max(...monthlySums, 100);
  const lineY = monthlySums.map(sum => 160 - (sum / maxVal) * 110); // scale up to 110px from base y=160

  const xCoords = [30, 115, 200, 285, 370];
  const baseY = 160;

  // Generate Bezier Curve path
  let pathD = `M ${xCoords[0]} ${lineY[0]}`;
  for (let i = 0; i < xCoords.length - 1; i++) {
    const x1 = xCoords[i];
    const y1 = lineY[i];
    const x2 = xCoords[i + 1];
    const y2 = lineY[i + 1];
    
    const cpX1 = x1 + (x2 - x1) / 2;
    const cpY1 = y1;
    const cpX2 = x1 + (x2 - x1) / 2;
    const cpY2 = y2;
    
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
  }

  // Path for Area under the curve
  const areaD = `${pathD} L ${xCoords[xCoords.length - 1]} ${baseY} L ${xCoords[0]} ${baseY} Z`;

  return (
    <div className="w-full h-full flex justify-center items-center select-none">
      <svg 
        viewBox="0 0 400 180" 
        width="100%" 
        height="100%" 
        className="overflow-visible"
      >
        {/* Gradients definitions */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F766E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="20" y1="160" x2="380" y2="160" stroke="#F1F5F9" strokeWidth="1.5" />
        <line x1="20" y1="110" x2="380" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="20" y1="60" x2="380" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Curved Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#0F766E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlight circle on Oct */}
        <circle
          cx={xCoords[3]}
          cy={lineY[3]}
          r="4.5"
          fill="#FFFFFF"
          stroke="#0F766E"
          strokeWidth="2"
          className="shadow-sm"
        />
        
        {/* Isolated ring indicator around Oct */}
        <circle
          cx={xCoords[3]}
          cy={lineY[3] - 25}
          r="6"
          fill="none"
          stroke="#0F766E"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Month labels */}
        {months.map((month, i) => (
          <text
            key={i}
            x={xCoords[i]}
            y="176"
            textAnchor="middle"
            className="text-[10px] font-bold text-slate-400 fill-current"
          >
            {month}
          </text>
        ))}
      </svg>
    </div>
  );
};

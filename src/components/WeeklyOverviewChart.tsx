import React from 'react';

export const WeeklyOverviewChart: React.FC = () => {
  const weeks = ['W1', 'W2', 'W3', 'W4'];
  const xCoords = [60, 150, 240, 330]; // Midpoint X for each week
  
  // Height values from base y=150
  const currentWeekHeights = [60, 85, 110, 75];
  const avgWeekHeights = [70, 80, 95, 80];
  const baseY = 150;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      <div className="relative w-full h-[160px] flex justify-center items-center">
        <svg 
          viewBox="0 0 400 170" 
          width="100%" 
          height="100%" 
          className="overflow-visible"
        >
          {/* Grid lines */}
          <line x1="30" y1="150" x2="370" y2="150" stroke="#F1F5F9" strokeWidth="1.5" />
          <line x1="30" y1="100" x2="370" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="30" y1="50" x2="370" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />

          {/* Draw bars */}
          {xCoords.map((x, i) => {
            const isW3Active = i === 2; // W3 is active
            
            const currentH = currentWeekHeights[i];
            const currentY = baseY - currentH;
            
            const avgH = avgWeekHeights[i];
            const avgY = baseY - avgH;

            return (
              <g key={i}>
                {/* Current Week Bar (Dark Teal) */}
                <rect
                  x={x - 14}
                  y={currentY}
                  width="10"
                  height={currentH}
                  rx="2"
                  fill="#0F766E"
                  className="transition-all duration-300 hover:opacity-80"
                />
                
                {/* Avg Weeks Bar (Light Teal) */}
                <rect
                  x={x + 4}
                  y={avgY}
                  width="10"
                  height={avgH}
                  rx="2"
                  fill="#2DD4BF"
                  opacity="0.75"
                  className="transition-all duration-300 hover:opacity-100"
                />

                {/* X Axis Labels */}
                <text
                  x={x}
                  y="166"
                  textAnchor="middle"
                  className={`text-[10px] fill-current transition-all ${
                    isW3Active ? 'font-bold text-[#0F766E]' : 'font-semibold text-slate-400'
                  }`}
                >
                  {weeks[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legends */}
      <div className="flex justify-center items-center gap-6 pb-2 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]"></span>
          <span>Current Week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]"></span>
          <span>Avg Weeks</span>
        </div>
      </div>
    </div>
  );
};

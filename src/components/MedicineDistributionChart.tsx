import React from 'react';

export const MedicineDistributionChart: React.FC = () => {
  // Donut chart parameters
  const size = 120;
  const center = size / 2;
  const r = 38;
  const strokeWidth = 12;
  const circ = 2 * Math.PI * r; // ~238.76

  // Categories: % value, stroke color, name
  const data = [
    { value: 45, color: '#0F766E', name: 'Antibiotics' },
    { value: 30, color: '#2DD4BF', name: 'Vitamins' },
    { value: 25, color: '#E2E8F0', name: 'Probiotics' },
  ];

  // Calculate cumulative offsets
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center justify-between gap-6 w-full select-none">
      {/* Left: Donut Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="-rotate-90 transform"
        >
          {data.map((item, i) => {
            const strokeLength = (item.value / 100) * circ;
            const strokeOffset = cumulativeOffset;
            cumulativeOffset -= strokeLength;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circ}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Total</span>
          <span className="text-[15px] font-extrabold text-slate-800 leading-tight">1,240</span>
        </div>
      </div>

      {/* Right: Legends */}
      <div className="flex-1 space-y-2.5 text-left text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="font-semibold text-slate-600">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

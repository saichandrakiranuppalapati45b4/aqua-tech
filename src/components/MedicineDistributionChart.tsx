import React from 'react';

interface MedicineDistributionChartProps {
  bills: any[];
}

export const MedicineDistributionChart: React.FC<MedicineDistributionChartProps> = ({ bills }) => {
  // Donut chart parameters
  const size = 120;
  const center = size / 2;
  const r = 38;
  const strokeWidth = 12;
  const circ = 2 * Math.PI * r; // ~238.76

  // Categorize medicine bills dynamically
  const categoryCounts: { [key: string]: number } = {};
  bills.forEach(b => {
    const cat = b.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalCount = bills.length;
  const total = totalCount || 1;

  // Colors for donut chart
  const colors = [
    '#0F766E', // primary teal
    '#2DD4BF', // light teal
    '#0D9488', // medium teal
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#EC4899', // pink
    '#6366F1', // indigo
    '#8B5CF6', // purple
    '#E2E8F0'  // slate (used for others/empty)
  ];

  // Map to sorted list of categories
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  const rawData = sortedCategories.map(([name, count], idx) => {
    return {
      value: Math.round((count / total) * 100),
      color: colors[idx % colors.length],
      name
    };
  });

  const data = totalCount > 0 ? rawData : [
    { value: 40, color: '#0F766E', name: 'Antibiotics' },
    { value: 35, color: '#2DD4BF', name: 'Vitamins' },
    { value: 25, color: '#E2E8F0', name: 'Probiotics' }
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
          <span className="text-[15px] font-extrabold text-slate-800 leading-tight">
            {totalCount.toLocaleString()}
          </span>
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

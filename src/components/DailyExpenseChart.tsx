import React from 'react';
export const DailyExpenseChart: React.FC = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const xCoords = [40, 95, 150, 205, 260, 315, 370];

    // Height from base y=150
    const barHeights = [55, 75, 58, 105, 70, 85, 78];
    const baseY = 160;
    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg
                viewBox="0 0 410 190"
                width="100%"
                height="100%"
                className="overflow-visible"
            >
                {/* Draw vertical grid lines */}
                <line x1="20" y1="160" x2="390" y2="160" stroke="#F1F5F9" strokeWidth="1.5" />

                {/* Draw bars and top dot circles */}
                {xCoords.map((x, i) => {
                    const isActive = i === 3; // Thu is highlighted
                    const height = barHeights[i];
                    const topY = baseY - height;

                    return (
                        <g key={i} className="group">
                            {/* Rounded Bar */}
                            <rect
                                x={x - 12}
                                y={topY}
                                width="24"
                                height={height}
                                rx="4"
                                fill={isActive ? '#0F766E' : '#CCFBF1'}
                                opacity={isActive ? '1' : '0.55'}
                                className="transition-all duration-300 group-hover:opacity-85"
                            />

                            {/* Top center dot */}
                            <circle
                                cx={x}
                                cy={topY + 6}
                                r="3"
                                fill={isActive ? '#CCFBF1' : '#0F766E'}
                                className="transition-all duration-300"
                            />
                            {/* Day label */}
                            <text
                                x={x}
                                y="180"
                                textAnchor="middle"
                                className={`text-[10px] fill-current transition-all ${isActive ? 'font-bold text-[#0F766E]' : 'font-semibold text-slate-400'
                                    }`}
                            >
                                {days[i]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
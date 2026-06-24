interface DailyExpenseChartProps {
    bills: any[];
}

export const DailyExpenseChart: React.FC<DailyExpenseChartProps> = ({ bills }) => {
    const days: string[] = [];
    const barHeights: number[] = [];

    // Group totals for the last 7 calendar days ending today
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push(dayLabel);

        const dayTotal = bills
            .filter(b => b.date === dateStr)
            .reduce((sum, b) => sum + Number(b.final_price || 0), 0);
        barHeights.push(dayTotal);
    }

    const maxVal = Math.max(...barHeights, 100);
    const scaledHeights = barHeights.map(h => (h / maxVal) * 110); // scale up to 110px

    const xCoords = [40, 95, 150, 205, 260, 315, 370];
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
                    const isActive = i === 6; // Highlight today (last day)
                    const height = scaledHeights[i];
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
interface WaveLogoProps {
  className?: string;
  size?: number;
}

export const WaveLogo = ({ className = '', size = 56 }: WaveLogoProps) => {
  return (
    <div 
      className={`flex items-center justify-center bg-[#0F766E] rounded-xl shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.55} 
        height={size * 0.55} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-white"
      >
        {/* Three stacked waves using bezier curves */}
        <path d="M3 6.5 C 5.5 8.5, 7.5 4.5, 10 6.5 C 12.5 8.5, 14.5 4.5, 17 6.5 C 19.5 8.5, 20.5 5.5, 21 6" />
        <path d="M3 11.5 C 5.5 13.5, 7.5 9.5, 10 11.5 C 12.5 13.5, 14.5 9.5, 17 11.5 C 19.5 13.5, 20.5 10.5, 21 11" />
        <path d="M3 16.5 C 5.5 18.5, 7.5 14.5, 10 16.5 C 12.5 18.5, 14.5 14.5, 17 16.5 C 19.5 18.5, 20.5 15.5, 21 16" />
      </svg>
    </div>
  );
};

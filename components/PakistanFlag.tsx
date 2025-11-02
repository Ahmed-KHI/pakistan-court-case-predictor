"use client";

interface PakistanFlagProps {
  className?: string;
}

export function PakistanFlag({ className = "" }: PakistanFlagProps) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Green field */}
        <rect width="900" height="600" fill="#01411C" />
        
        {/* White stripe */}
        <rect width="225" height="600" fill="#FFFFFF" />
        
        {/* Crescent and Star - CORRECT Pakistan Flag Design */}
        <g transform="translate(562.5, 300)">
          {/* White Crescent - Opens to the left (hoist side) */}
          <path
            d="M -20,-75 A 85,85 0 1,0 -20,75 A 65,65 0 1,1 -20,-75 Z"
            fill="#FFFFFF"
          />
          
          {/* Five-pointed Star - Positioned between the crescent tips */}
          <g transform="translate(15, 0)">
            <path
              d="M 0,-30 L 9,-9 L 31,-9 L 14,4 L 20,26 L 0,13 L -20,26 L -14,4 L -31,-9 L -9,-9 Z"
              fill="#FFFFFF"
            />
          </g>
        </g>
      </svg>
      
      {/* Subtle shadow overlay for depth */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/5 pointer-events-none"></div>
    </div>
  );
}

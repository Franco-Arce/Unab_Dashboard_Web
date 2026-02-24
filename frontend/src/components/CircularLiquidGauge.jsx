import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveBubbles } from './MetricCard';

export const CircularLiquidGauge = ({ percent, color = 'from-blue-600 to-blue-800', size = 96 }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            {/* SVG Progress Border */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                    cx="50%" cy="50%" r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100"
                />
                <motion.circle
                    cx="50%" cy="50%" r={radius}
                    fill="transparent"
                    stroke="url(#gradient-circle)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
                <defs>
                    <linearGradient id="gradient-circle" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Liquid Interior */}
            <div className="absolute w-[70px] h-[70px] rounded-full overflow-hidden z-0">
                {/* Parallax Waves */}
                <div
                    className={`absolute inset-0 opacity-30 bg-gradient-to-t ${color} animate-liquid-1`}
                    style={{
                        backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.2), transparent)`,
                        width: '300%',
                        bottom: `-${100 - percent}%`,
                        borderRadius: '40%'
                    }}
                />
                <div
                    className={`absolute inset-0 opacity-20 bg-gradient-to-t ${color} animate-liquid-2`}
                    style={{
                        backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.1), transparent)`,
                        width: '300%',
                        bottom: `-${100 - percent + 5}%`,
                        borderRadius: '38%'
                    }}
                />

                {/* Bubbles */}
                <InteractiveBubbles count={6} isHovered={true} />

                {/* Top Reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
            </div>

            {/* Percentage Text */}
            <span className="absolute text-lg font-black text-slate-900 z-10 drop-shadow-sm">
                {Math.round(percent)}%
            </span>
        </div>
    );
};

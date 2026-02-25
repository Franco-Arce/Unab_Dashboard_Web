import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveBubbles } from './MetricCard';

export const CircularLiquidGauge = ({ percent, color = 'from-blue-600 to-blue-800', size = 96 }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: [1, 1.03, 1],
                opacity: 1
            }}
            transition={{
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 1 }
            }}
            className="relative flex items-center justify-center shrink-0"
            style={{ width: size, height: size }}
        >
            {/* SVG Progress Border with Persistent Rotation */}
            <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-full -rotate-90"
            >
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
                    transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
                    style={{ strokeDasharray: circumference }}
                />
                <defs>
                    <linearGradient id="gradient-circle" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </motion.svg>

            {/* Liquid Interior */}
            <div className="absolute w-[70px] h-[70px] rounded-full overflow-hidden z-0 shadow-inner">
                {/* Parallax Waves with larger movement */}
                <div
                    className={`absolute inset-0 opacity-45 bg-gradient-to-t ${color} animate-liquid-1`}
                    style={{
                        backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.3), transparent)`,
                        width: '400%',
                        bottom: `-${100 - percent}%`,
                        borderRadius: '35%'
                    }}
                />
                <div
                    className={`absolute inset-0 opacity-30 bg-gradient-to-t ${color} animate-liquid-2`}
                    style={{
                        backgroundImage: `linear-gradient(to top, rgba(255,255,255,0.2), transparent)`,
                        width: '400%',
                        bottom: `-${100 - percent + 8}%`,
                        borderRadius: '42%'
                    }}
                />

                {/* Bubbles - More active */}
                <InteractiveBubbles count={12} isHovered={true} />

                {/* Top Reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Percentage Text with subtle pulse */}
            <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute text-lg font-black text-slate-900 z-10 drop-shadow-md select-none"
            >
                {Math.round(percent)}%
            </motion.span>
        </motion.div>
    );
};

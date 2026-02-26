import React from 'react';
import { motion } from 'framer-motion';

export const ElegantLoader = ({ label = "Cargando datos..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-20 h-20">
                {/* Outer Glow Ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: 360,
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500/30 blur-sm"
                />

                {/* Main Spinning Gradient Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-full h-full rounded-full border-4 border-transparent border-t-indigo-600 border-r-blue-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                />

                {/* Inner Pulsing Core */}
                <motion.div
                    animate={{
                        scale: [0.8, 1.1, 0.8],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 shadow-inner"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">
                    {label}
                </span>
                <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export const SectionPlaceholder = ({ height = "300px", className = "" }) => (
    <div
        style={{ height }}
        className={`w-full bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl flex items-center justify-center overflow-hidden relative ${className}`}
    >
        {/* Animated background shine */}
        <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        />
        <ElegantLoader />
    </div>
);

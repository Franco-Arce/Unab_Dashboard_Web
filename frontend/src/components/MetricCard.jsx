import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

// --- COMPONENTE DE BURBUJAS INTERACTIVAS ---
export const InteractiveBubbles = ({ count = 5, isHovered }) => {
    const bubbles = useMemo(() => Array.from({ length: count }), [count]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {bubbles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "120%", x: Math.random() * 100 + "%", opacity: 0 }}
                    animate={{
                        y: "-20%",
                        opacity: [0, 0.4, 0],
                        x: (Math.random() * 100) + (isHovered ? (Math.random() * 20 - 10) : 0) + "%"
                    }}
                    transition={{
                        duration: isHovered ? (1.5 + Math.random()) : (3 + Math.random() * 2),
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                    className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
};

// --- COMPONENTE DE TARJETA INDIVIDUAL ---
export const MetricCard = ({ data }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = data.icon;

    // Default values mapping to prevent errors if some props are missing
    const label = data.label || 'Métrica';
    const value = typeof data.value !== 'undefined' ? data.value : 0;
    const trend = data.trend || '0%';
    const color = data.color || 'from-blue-600 to-blue-800';
    const fill = data.fill || 'h-[30%]';

    const isPositiveTrend = typeof trend === 'string' && trend.includes('+');
    const isNegativeTrend = typeof trend === 'string' && trend.includes('-');

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -8 }}
            className="relative bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group h-48 flex flex-col justify-between"
        >
            {/* CAPA 1: Fondo Líquido (Marea) */}
            <motion.div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} opacity-10 transition-all duration-700 ease-in-out ${fill}`}
                animate={isHovered ? { height: '100%', opacity: 0.15 } : {}}
            />

            {/* CAPA 2: Ondas en la superficie del agua (Solo visible en hover o base) */}
            <motion.div
                animate={{ x: [-100, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`absolute bottom-0 left-0 w-[200%] h-full opacity-[0.05] pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent`}
                style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, white 0%, transparent 70%)', backgroundSize: '50% 20px' }}
            />

            {/* CAPA 3: Partículas/Burbujas */}
            <InteractiveBubbles count={isHovered ? 12 : 6} isHovered={isHovered} />

            {/* CONTENIDO SUPERIOR: Icono y Trend */}
            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-500`}>
                    {Icon && <Icon size={22} />}
                </div>
                {trend && trend !== '0%' && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isPositiveTrend ? 'bg-emerald-50 text-emerald-600' : isNegativeTrend ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                        {isPositiveTrend ? <TrendingUp size={10} /> : <ArrowUpRight size={10} className={isNegativeTrend ? "rotate-90" : ""} />}
                        {trend}
                    </div>
                )}
            </div>

            {/* CONTENIDO INFERIOR: Texto y Valor */}
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-600 transition-colors">
                    {label}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    {data.unit !== null && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                            {data.unit || 'unid.'}
                        </span>
                    )}
                </div>
            </div>

            {/* Decoración de esquina interactiva: Muestra el trend comparado a la última actualización */}
            <motion.div
                animate={isHovered ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-6 right-6 pointer-events-none flex flex-col items-end z-20"
            >
                <div className={`
                    px-4 py-2 rounded-2xl backdrop-blur-md border shadow-lg flex flex-col items-end
                    ${isPositiveTrend ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                        isNegativeTrend ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' :
                            'bg-slate-500/10 border-slate-500/20 text-slate-600'}
                `}>
                    <span className="text-3xl font-black tracking-tighter leading-none mb-1">
                        {trend}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 whitespace-nowrap">
                        vs ult. actualización
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

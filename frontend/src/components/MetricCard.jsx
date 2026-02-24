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
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} opacity-10 transition-all duration-700 ease-in-out ${fill}`}
            />

            {/* CAPA 2: Ondas en la superficie del agua (Solo visible en hover o base) */}
            <motion.div
                animate={{ x: [-100, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`absolute bottom-0 left-0 w-[200%] h-full opacity-[0.05] pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent`}
                style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, white 0%, transparent 70%)', backgroundSize: '50% 20px' }}
            />

            {/* CAPA 3: Partículas/Burbujas */}
            <InteractiveBubbles count={isHovered ? 20 : 6} isHovered={isHovered} />

            {/* CONTENIDO SUPERIOR: Icono y Trend */}
            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-500`}>
                    {Icon && <Icon size={22} />}
                </div>
                {trend && trend !== '0%' ? (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isPositiveTrend ? 'bg-emerald-50 text-emerald-600' : isNegativeTrend ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                        {isPositiveTrend ? <TrendingUp size={10} /> : <ArrowUpRight size={10} className={isNegativeTrend ? "rotate-90" : ""} />}
                        {trend}
                    </div>
                ) : null}
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
                animate={isHovered ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 5 }}
                className="absolute top-4 right-4 pointer-events-none flex flex-col items-end z-20"
            >
                <div className={`
                    px-2 py-1 rounded-lg backdrop-blur-md border shadow-lg flex flex-col items-end transform transition-all duration-300
                    ${isHovered ? 'scale-110' : 'scale-100'}
                    ${isPositiveTrend ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700' :
                        isNegativeTrend ? 'bg-rose-500/20 border-rose-500/30 text-rose-700' :
                            'bg-slate-500/20 border-slate-500/30 text-slate-700'}
                `}>
                    <span className="text-[10px] font-black tracking-tighter leading-none mb-0.5">
                        {trend}
                    </span>
                    <span className="text-[6px] font-black uppercase tracking-[0.1em] opacity-70 whitespace-nowrap leading-none">
                        vs update
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

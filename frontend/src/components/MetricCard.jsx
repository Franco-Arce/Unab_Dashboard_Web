import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

/**
 * Componente de burbujas interactivas
 * Utilizado por CircularLiquidGauge y componentes de métricas.
 */
export const InteractiveBubbles = ({ count = 5, isHovered }) => {
    const bubbles = React.useMemo(() => Array.from({ length: count }), [count]);

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

/**
 * Componente Wave (Onda)
 * Crea el efecto visual de agua usando un path SVG animado.
 */
const WaveEffect = ({ color, opacity = 1, duration = 4, delay = 0, speed = 1 }) => {
    return (
        <motion.svg
            viewBox="0 0 120 28"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-[200%] h-10 pointer-events-none"
            initial={{ x: "-50%" }}
            animate={{ x: "0%" }}
            transition={{
                repeat: Infinity,
                duration: duration / speed,
                ease: "linear",
                delay: delay
            }}
        >
            <path
                d="M0 15 C 30 15 30 5 60 5 S 90 15 120 15 V 30 H 0 Z"
                fill={color}
                fillOpacity={opacity}
            />
            <path
                d="M-120 15 C -90 15 -90 5 -60 5 S -30 15 0 15 V 30 H -120 Z"
                fill={color}
                fillOpacity={opacity}
            />
        </motion.svg>
    );
};

/**
 * MetricCard con nivel de llenado dinámico (Liquid Design)
 */
export const MetricCard = ({ data }) => {
    const Icon = data.icon;
    const label = data.label || 'Métrica';
    const value = typeof data.value !== 'undefined' ? data.value : 0;
    const trend = data.trend || '0%';
    const percentage = data.percentage || 0;

    // Mapeo de colores basado en el diseño del usuario
    const colorMap = {
        'from-blue-600 to-blue-800': {
            bg: 'bg-blue-100/70',
            wave: '#dbeafe',
            icon: 'bg-blue-600'
        },
        'from-emerald-500 to-teal-600': {
            bg: 'bg-emerald-100/70',
            wave: '#d1fae5',
            icon: 'bg-emerald-500'
        },
        'from-indigo-500 to-blue-700': {
            bg: 'bg-indigo-100/70',
            wave: '#e0e7ff',
            icon: 'bg-indigo-500'
        },
        'from-cyan-500 to-blue-500': {
            bg: 'bg-sky-100/70',
            wave: '#e0f2fe',
            icon: 'bg-sky-500'
        },
        'from-rose-600 to-rose-900': {
            bg: 'bg-rose-100/70',
            wave: '#ffe4e6',
            icon: 'bg-rose-600'
        }
    };

    const theme = colorMap[data.color] || colorMap['from-blue-600 to-blue-800'];
    const isPositiveTrend = typeof trend === 'string' && trend.includes('+');
    const isNegativeTrend = typeof trend === 'string' && trend.includes('-');

    return (
        <div className="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-52 border border-slate-100 group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">

            {/* Contenedor del Líquido Dinámico */}
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-end">
                <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className={`w-full relative ${theme.bg}`}
                >
                    {/* Múltiples ondas en la parte superior del nivel actual */}
                    <div className="absolute bottom-full left-0 w-full h-10 overflow-hidden">
                        <WaveEffect color={theme.wave} opacity={0.3} duration={7} delay={0} />
                        <WaveEffect color={theme.wave} opacity={0.4} duration={5} delay={-2} />
                        <WaveEffect color={theme.wave} opacity={0.6} duration={3} delay={-1} />
                    </div>
                </motion.div>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl shadow-lg ${theme.icon} text-white transition-transform group-hover:rotate-6 duration-500`}>
                        {Icon && <Icon size={22} strokeWidth={2.5} />}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {trend && trend !== '0%' && (
                            <div className={`backdrop-blur-md border px-2 py-1 rounded-lg text-[10px] font-black flex flex-col items-center shadow-sm transition-all duration-300 ${isPositiveTrend ? 'bg-emerald-50/80 border-emerald-100 text-emerald-600' :
                                isNegativeTrend ? 'bg-rose-50/80 border-rose-100 text-rose-600' :
                                    'bg-slate-50/80 border-slate-100 text-slate-600'
                                }`}>
                                <div className="flex items-center gap-1">
                                    {isPositiveTrend ? <TrendingUp size={10} /> : <ArrowUpRight size={10} className={isNegativeTrend ? "rotate-90" : ""} />}
                                    <span>{trend}</span>
                                </div>
                                <span className="text-[6px] opacity-60 uppercase tracking-widest">vs update</span>
                            </div>
                        )}
                        <span className="text-[10px] font-black text-slate-400 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100/50 shadow-sm">
                            {percentage}%
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-600 transition-colors">
                        {label}
                    </h3>
                    <div className="flex flex-col gap-1">
                        <h3 className={`font-black text-slate-900 tracking-tighter leading-tight ${typeof value === 'string' && value.length > 20 ? 'text-sm' :
                                typeof value === 'string' && value.length > 10 ? 'text-xl' : 'text-3xl'
                            }`}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                        {data.description && (
                            <div className="flex">
                                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border shadow-sm transition-all duration-300 ${data.color?.includes('orange') || data.color?.includes('amber') ? 'bg-orange-50/80 border-orange-100 text-orange-600' :
                                        data.color?.includes('blue') ? 'bg-blue-50/80 border-blue-100 text-blue-600' :
                                            data.color?.includes('emerald') || data.color?.includes('teal') ? 'bg-emerald-50/80 border-emerald-100 text-emerald-600' :
                                                data.color?.includes('violet') || data.color?.includes('purple') ? 'bg-purple-50/80 border-purple-100 text-purple-600' :
                                                    data.color?.includes('slate') ? 'bg-slate-50/80 border-slate-100 text-slate-600' :
                                                        'bg-indigo-50/80 border-indigo-100 text-indigo-600'
                                    }`}>
                                    {data.description}
                                </span>
                            </div>
                        )}
                        {typeof value === 'number' && data.unit !== null && !data.description && (
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                {data.unit || 'unid.'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

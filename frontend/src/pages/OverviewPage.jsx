import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    UserPlus,
    CreditCard,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    GraduationCap,
    UserCheck,
    Star,
    AlertCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { MetricCard } from '../components/MetricCard';
import { SummaryCards } from '../components/SummaryCards';
import { CircularLiquidGauge } from '../components/CircularLiquidGauge';

// Floating bubbles component for liquid effect
const FloatingBubbles = ({ count = 6 }) => {
    const bubbles = useMemo(() => Array.from({ length: count }), [count]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {bubbles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 40, x: Math.random() * 100 + "%", opacity: 0 }}
                    animate={{
                        y: -20,
                        opacity: [0, 0.4, 0],
                        x: (Math.random() * 100) + (Math.random() * 10 - 5) + "%"
                    }}
                    transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                />
            ))}
        </div>
    );
};

export default function OverviewPage() {
    const [kpis, setKpis] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const { nivel } = useFilters();

    useEffect(() => {
        const load = async () => {
            try {
                const k = await api.kpis(nivel);
                const f = await api.funnel(nivel);
                setKpis(k);
                setFunnel(f);

                const i = await api.aiInsights();
                setInsights(i.insights || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [nivel]);

    if (loading) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-pulse"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-zinc-100 shadow-sm" />)}
            </div>
            <div className="h-[400px] bg-white rounded-3xl border border-zinc-100 shadow-sm" />
        </motion.div>
    );

    const formatTrend = (val) => {
        if (!val) return '0%';
        if (val > 0) return `+${val}%`;
        return `${val}%`;
    };

    const trends = kpis.trends || { total_leads: 0, matriculados: 0, en_gestion: 0, pagados: 0 };

    const getIcon = (iconStr) => {
        switch (iconStr) {
            case 'trending_up': return TrendingUp;
            case 'trending_down': return TrendingDown;
            case 'alert': return AlertCircle;
            case 'star': return Star;
            default: return Star;
        }
    };

    const aiCards = insights.map((insight, idx) => ({
        id: `ai-${idx}`,
        label: insight.title,
        value: null,
        description: insight.description,
        icon: getIcon(insight.icon),
        color: idx % 2 === 0 ? 'from-indigo-500 to-blue-700' : 'from-emerald-500 to-teal-600',
        percentage: 30 + (idx * 15),
        unit: null
    }));

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <SummaryCards kpis={kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white border border-nods-border rounded-3xl p-8 relative overflow-hidden group shadow-xl">
                        <div className="flex justify-between items-end mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-nods-text-primary">Embudo de Conversión</h3>
                                <p className="text-nods-text-muted text-sm font-medium">Rendimiento de las etapas de la campaña</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border border-nods-border text-nods-text-primary uppercase tracking-widest">
                                {nivel === 'TODOS' ? 'Global' : nivel}
                            </div>
                        </div>

                        <div className="py-4 w-full flex flex-col gap-2 relative z-10 min-h-[320px]">
                            {funnel.map((entry, index) => {
                                // Calculate efficiency vs a previous step that makes mathematical sense (>= current value)
                                let efficiency = null;
                                if (index > 0) {
                                    let prevIdx = index - 1;
                                    while (prevIdx >= 0 && funnel[prevIdx].value < entry.value) {
                                        prevIdx--;
                                    }
                                    if (prevIdx >= 0 && funnel[prevIdx].value > 0) {
                                        efficiency = ((entry.value / funnel[prevIdx].value) * 100).toFixed(1);
                                    }
                                }

                                const themeColors = ["#1e3a8a", "#2563eb", "#3b82f6", "#06b6d4", "#10b981"];
                                const barColor = themeColors[index] || entry.color;

                                return (
                                    <div key={index} className="relative">
                                        {/* Full-width bar container */}
                                        <div className="w-full h-14 bg-slate-100/60 rounded-2xl border border-slate-200/40 relative overflow-hidden group cursor-default">

                                            {/* Progress Fill — all data is INSIDE */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(entry.percent, 18)}%` }}
                                                transition={{ duration: 1.6, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                                                className="h-full flex items-center justify-between px-5 relative z-10 shadow-[4px_0_15px_rgba(0,0,0,0.12)] overflow-hidden rounded-2xl"
                                                style={{ backgroundColor: barColor }}
                                            >
                                                {/* Liquid wave layer 1 */}
                                                <div
                                                    className="absolute inset-0 opacity-10 pointer-events-none animate-liquid-1"
                                                    style={{
                                                        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 20px, white 20px, white 40px)`,
                                                        width: '300%'
                                                    }}
                                                />
                                                {/* Liquid wave layer 2 */}
                                                <div
                                                    className="absolute inset-0 opacity-[0.06] pointer-events-none animate-liquid-2"
                                                    style={{
                                                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, white 30px, white 60px)`,
                                                        width: '300%'
                                                    }}
                                                />
                                                {/* Floating bubbles */}
                                                <FloatingBubbles count={entry.percent > 50 ? 6 : 3} />
                                                {/* Top reflection */}
                                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none z-20" />

                                                {/* Stage name — left side */}
                                                <span className="font-black whitespace-nowrap text-white text-xs relative z-30 tracking-wide uppercase drop-shadow-md">
                                                    {entry.stage}
                                                </span>

                                                {/* Volume + Percentage — right side, inside the bar */}
                                                <div className="flex items-center gap-3 relative z-30">
                                                    <span className="text-white/90 font-black text-lg leading-none tracking-tight drop-shadow-sm">
                                                        {entry.value.toLocaleString()}
                                                    </span>
                                                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/20">
                                                        {entry.percent}%
                                                    </span>
                                                </div>
                                            </motion.div>

                                            {/* Fallback: label + data outside for very small bars */}
                                            {entry.percent < 18 && (
                                                <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none z-20">
                                                    <span className="text-slate-700 font-black text-xs uppercase tracking-wide" style={{ marginLeft: `${Math.max(entry.percent, 5) + 2}%` }}>
                                                        {entry.stage}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-800 font-black text-lg leading-none tracking-tight">
                                                            {entry.value.toLocaleString()}
                                                        </span>
                                                        <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                                                            {entry.percent}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Efficiency connector */}
                                        {efficiency !== null && (
                                            <div className="flex justify-center my-0.5 relative h-6">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 1 + index * 0.1 }}
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1 rounded-full shadow-md z-30"
                                                >
                                                    <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-emerald-400">{efficiency}%</span>
                                                    </span>
                                                </motion.div>
                                                <div className="w-px h-full border-l border-dashed border-slate-200 mx-auto" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Quick Stats vertically stacked */}
                <div className="flex flex-col space-y-6 justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 w-full relative overflow-hidden group"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 italic">Eficiencia</h4>
                        <div className="flex items-center gap-8 relative z-10">
                            <CircularLiquidGauge
                                percent={(kpis.matriculados / kpis.total_leads) * 100}
                                color="from-blue-600 to-indigo-700"
                            />
                            <div>
                                <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Tasa de Conversión</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter opacity-70 italic">Leads a Matriculados</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 w-full relative overflow-hidden group"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 italic">Salud de Base</h4>
                        <div className="flex items-center gap-8 relative z-10">
                            <CircularLiquidGauge
                                percent={(kpis.en_gestion / kpis.total_leads) * 100}
                                color="from-orange-500 to-amber-600"
                            />
                            <div>
                                <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Cobertura</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter opacity-70 italic">Leads en gestión</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* AI Insights Section moved below funnel */}
            {aiCards.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Star className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-nods-text-primary">Insights del Analista</h3>
                            <p className="text-nods-text-muted text-sm font-medium">Análisis predictivo y recomendaciones inteligentes</p>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {aiCards.map((card, i) => (
                            <motion.div key={card.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                                <MetricCard data={card} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

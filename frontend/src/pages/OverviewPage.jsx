import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Semicircular Gauge component for "Avance vs Meta" with liquid animation
const SemiGauge = ({ percent, current, total, label }) => {
    const clampedPercent = Math.min(Math.max(percent, 0), 100);
    const radius = 70;
    const strokeWidth = 12;
    const circumference = Math.PI * radius;
    const offset = circumference - (clampedPercent / 100) * circumference;
    const cx = 100;
    const cy = 85;

    // Gradient ID based on progress
    const gradientId = 'semi-gauge-gradient';
    const colors = clampedPercent >= 75
        ? ['#10b981', '#059669']
        : clampedPercent >= 50
            ? ['#f59e0b', '#d97706']
            : clampedPercent >= 25
                ? ['#f97316', '#ea580c']
                : ['#ef4444', '#dc2626'];

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: [1, 1.02, 1], opacity: 1 }}
            transition={{
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.8 }
            }}
            className="flex flex-col items-center relative"
        >
            <svg width="200" height="110" viewBox="0 0 200 110">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                    </linearGradient>
                    <filter id="semi-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Background track */}
                <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress arc with gradient and glow */}
                <motion.path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, delay: 0.3, ease: 'circOut' }}
                    filter="url(#semi-glow)"
                />
                {/* Center percentage */}
                <text x={cx} y={cy - 18} textAnchor="middle" fill="#0f172a" style={{ fontSize: '28px', fontWeight: 900 }}>
                    {clampedPercent.toFixed(1)}%
                </text>
                <text x={cx} y={cy + 2} textAnchor="middle" fill="#64748b" style={{ fontSize: '10px', fontWeight: 700 }}>
                    {current.toLocaleString()} / {total.toLocaleString()} {label}
                </text>
            </svg>
        </motion.div>
    );
};

export default function OverviewPage() {
    const [kpis, setKpis] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [insights, setInsights] = useState([]);
    const [topPrograms, setTopPrograms] = useState([]);
    const [allPrograms, setAllPrograms] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('TODAS');
    const [loading, setLoading] = useState(true);
    const { nivel } = useFilters();

    useEffect(() => {
        const load = async () => {
            try {
                const k = await api.kpis(nivel);
                const f = await api.funnel(nivel);
                setKpis(k);
                setFunnel(f);

                // Fetch admisiones for top conversion programs
                try {
                    const adm = await api.admisiones(nivel);
                    const progs = (adm.programas || [])
                        .filter(p => p.leads > 10 && p.pagados > 0)
                        .map(p => ({
                            programa: p.programa,
                            leads: p.leads,
                            pagados: p.pagados,
                            conversion: parseFloat(((p.pagados / p.leads) * 100).toFixed(1))
                        }))
                        .sort((a, b) => b.conversion - a.conversion)
                        .slice(0, 8);
                    setTopPrograms(progs);

                    // Store all programs with area info for Avance vs Meta chart
                    const allProgs = (adm.programas || [])
                        .filter(p => p.meta > 0)
                        .map(p => ({
                            programa: p.programa,
                            pagados: p.pagados || 0,
                            meta: p.meta || 0,
                            area: p.area || 'SIN ÁREA'
                        }));
                    setAllPrograms(allProgs);

                    // Extract unique areas
                    const uniqueAreas = [...new Set(allProgs.map(p => p.area))].sort();
                    setAreas(uniqueAreas);
                } catch (e) { console.error('Error loading admisiones for overview', e); }

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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white border border-nods-border rounded-3xl p-8 relative group shadow-xl">
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

                                                {/* Stage name — always inside, clipped by bar edge */}
                                                <span className="font-black whitespace-nowrap text-white text-xs relative z-30 tracking-wide uppercase drop-shadow-md">
                                                    {entry.stage}
                                                </span>
                                            </motion.div>

                                            {/* Volume + Percentage — always outside on the right */}
                                            <div className="absolute right-4 inset-y-0 flex items-center gap-3 pointer-events-none z-20">
                                                <span className="text-slate-800 font-black text-lg leading-none tracking-tight">
                                                    {entry.value.toLocaleString()}
                                                </span>
                                                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                                                    {entry.percent}%
                                                </span>
                                            </div>
                                        </div>


                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Quick Stats vertically stacked — stretch to match funnel */}
                <div className="flex flex-col gap-4 justify-stretch">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 w-full relative overflow-hidden group flex-1"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 italic">Eficiencia</h4>
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
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 w-full relative overflow-hidden group flex-1"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 italic">Salud de Base</h4>
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

                    {/* Avance vs Meta Global */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 w-full relative overflow-hidden group flex-1"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 italic">Avance vs Meta</h4>
                        <SemiGauge
                            percent={kpis.metas > 0 ? (kpis.pagados / kpis.metas) * 100 : 0}
                            current={kpis.pagados || 0}
                            total={kpis.metas || 0}
                            label="pagados"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Top Conversión + Avance vs Meta por Programa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-white border border-nods-border rounded-3xl p-8 shadow-xl"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-nods-text-primary">Top Conversión por Programa</h3>
                        <p className="text-nods-text-muted text-sm font-medium">Programas con mayor tasa de conversión (leads → pagados)</p>
                    </div>
                    <div className="space-y-3">
                        {topPrograms.length > 0 ? topPrograms.map((prog, i) => {
                            const maxConversion = topPrograms[0]?.conversion || 1;
                            const barWidth = (prog.conversion / maxConversion) * 100;
                            const barColors = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#06b6d4', '#14b8a6', '#10b981', '#34d399'];
                            return (
                                <motion.div
                                    key={prog.programa}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + i * 0.05 }}
                                    className="group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[60%]" title={prog.programa}>
                                            {prog.programa.length > 30 ? prog.programa.slice(0, 30) + '…' : prog.programa}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-bold">{prog.pagados}/{prog.leads}</span>
                                            <span className="text-xs font-black text-slate-900">{prog.conversion}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${barWidth}%` }}
                                            transition={{ duration: 1.2, delay: 0.8 + i * 0.05, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: barColors[i] || '#3b82f6' }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">Sin datos suficientes</div>
                        )}
                    </div>
                </motion.div>

                {/* Avance vs Meta por Programa */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="bg-white border border-nods-border rounded-3xl p-8 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-nods-text-primary">Avance vs Meta por Programa</h3>
                            <p className="text-nods-text-muted text-sm font-medium">Progreso hacia la Meta (Gráfico de Barras)</p>
                        </div>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="TODAS">Todas las Áreas</option>
                            {areas.map(a => (
                                <option key={a} value={a}>{a.charAt(0) + a.slice(1).toLowerCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full" style={{ height: 320 }}>
                        {(() => {
                            const filtered = allPrograms
                                .filter(p => selectedArea === 'TODAS' || p.area === selectedArea)
                                .sort((a, b) => b.meta - a.meta)
                                .slice(0, 10)
                                .map(p => ({
                                    ...p,
                                    shortName: (() => {
                                        let n = p.programa
                                            .replace(/ESPECIALIZACI[ÓO]N/gi, 'Esp.')
                                            .replace(/TECNOLOG[ÍI]A/gi, 'Tec.')
                                            .replace(/ADMINISTRACI[ÓO]N/gi, 'Adm.')
                                            .replace(/INGENIER[ÍI]A/gi, 'Ing.')
                                            .replace(/MAESTR[ÍI]A/gi, 'Mtr.')
                                            .replace(/CONTADUR[ÍI]A/gi, 'Cont.')
                                            .replace(/LICENCIATURA/gi, 'Lic.');
                                        return n.length > 24 ? n.slice(0, 22) + '…' : n;
                                    })()
                                }));

                            if (filtered.length === 0) {
                                return <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Sin datos para esta área</div>;
                            }

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filtered} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barSize={18} barGap={-18}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="shortName"
                                            tick={{ fontSize: 9, fontWeight: 600, fill: '#475569' }}
                                            width={140}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                padding: '10px 14px'
                                            }}
                                            formatter={(value, name) => [
                                                value.toLocaleString(),
                                                name === 'meta' ? 'Meta' : 'Pagados'
                                            ]}
                                            labelFormatter={(label) => label}
                                        />
                                        <Bar dataKey="meta" fill="#cbd5e1" radius={[0, 6, 6, 0]} name="meta" />
                                        <Bar dataKey="pagados" fill="#10b981" radius={[0, 6, 6, 0]} name="pagados" />
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-slate-300" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Meta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Pagados</span>
                        </div>
                    </div>
                </motion.div>
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

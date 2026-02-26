import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, AlertOctagon, Calendar, Clock, Filter, ArrowRight, TrendingDown, Star } from 'lucide-react';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { exportToCSV } from '../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { SummaryCards } from '../components/SummaryCards';
import { MetricCard } from '../components/MetricCard';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

const COLORS = [
    '#FBBF24', '#FB923C', '#F59E0B', '#D97706', '#B45309',
    '#92400E', '#78350F', '#6366F1', '#8B5CF6', '#D946EF',
    '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'
];

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { nivel } = useFilters();

    const [kpisData, setKpisData] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.noUtil(nivel),
            api.kpis(nivel)
        ])
            .then(([noUtilRes, kpisRes]) => {
                setData(noUtilRes);
                setKpisData(kpisRes);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [nivel]);

    const filtered = useMemo(() => {
        if (!data || !data.no_util) return [];
        return data.no_util.filter(item =>
            (item.subcategoria || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const topReason = useMemo(() => {
        if (!data || !data.no_util || data.no_util.length === 0) return null;
        return [...data.no_util].sort((a, b) => b.leads - a.leads)[0];
    }, [data]);

    const chartData = useMemo(() => {
        if (!data || !data.no_util) return [];
        const sorted = [...data.no_util].sort((a, b) => b.leads - a.leads);
        const top = sorted.slice(0, 15);
        const others = sorted.slice(15);

        if (others.length > 0) {
            top.push({
                subcategoria: 'Otras',
                leads: others.reduce((acc, curr) => acc + curr.leads, 0)
            });
        }
        return top.map(item => ({
            name: item.subcategoria,
            value: item.leads
        }));
    }, [data]);

    const totalLeadsNoUtil = useMemo(() => {
        if (!data || !data.no_util) return 0;
        return data.no_util.reduce((acc, curr) => acc + (curr.leads || 0), 0);
    }, [data]);

    if (loading) return (
        <div className="space-y-8 animate-pulse p-8">
            <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-800 rounded-3xl" />)}
            </div>
            <div className="h-96 bg-zinc-800 rounded-3xl" />
        </div>
    );

    if (!data || !data.no_util || data.no_util.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800 shadow-2xl">
                    <AlertOctagon className="w-12 h-12 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">No hay datos disponibles</h3>
                <p className="text-zinc-500 text-sm">Los leads clasificados como no útiles aparecerán aquí.</p>
            </div>
        );
    }

    const handleExport = () => {
        exportToCSV(data.no_util, 'leads_no_util_unab_2026');
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
                    <p className="text-lg font-black text-white">
                        {payload[0].value.toLocaleString()}
                        <span className="text-xs font-normal text-slate-500 ml-2">leads</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 p-4 md:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-black text-nods-text-primary tracking-tight uppercase italic">Auditoría: Leads No Útiles</h2>
                    <p className="text-nods-text-muted text-sm font-medium">Análisis detallado de los descartes por subcategoría</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-nods-text-primary border border-nods-border px-4 py-2 rounded-xl text-xs font-black hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        EXPORTAR DATA
                    </button>
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-[10px] font-black text-amber-600 uppercase tracking-[0.15em]">
                        Filtro: {nivel}
                    </div>
                </div>
            </header>

            {/* KPI Section */}
            <SummaryCards kpis={kpisData || {}} />

            {/* Expanded Chart & Side Insights Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Donut Chart with Legend (Fills 2/3) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="xl:col-span-2 bg-white border border-nods-border rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-nods-text-primary flex items-center gap-2">
                                <div className="w-2 h-6 bg-amber-500 rounded-full" />
                                Distribución detallada de descartes
                            </h3>
                            <p className="text-nods-text-muted text-xs font-bold uppercase tracking-widest">Top 15 motivos de no utilidad</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Donut Container */}
                        <div className="w-full lg:w-1/2 h-[340px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={85}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Inner Circle Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-4xl font-black text-slate-900 leading-none">{totalLeadsNoUtil.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Leads</span>
                                </motion.div>
                            </div>

                            {/* Decorative Liquid Glow */}
                            <div className="absolute inset-0 rounded-full border-[10px] border-slate-50/50 -z-10 pointer-events-none" />
                        </div>

                        {/* Side Legend */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-3 py-4 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
                            {chartData.map((entry, idx) => (
                                <motion.div
                                    key={entry.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between group cursor-default"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        />
                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[180px] group-hover:text-slate-900 transition-colors">
                                            {entry.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-900 px-2 py-0.5 rounded-md min-w-[50px] text-center">
                                            <span className="text-[10px] font-black text-amber-400">{((entry.value / totalLeadsNoUtil) * 100).toFixed(1)}%</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 min-w-[40px] text-right">{entry.value.toLocaleString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Vertical Context Section (Subtle Style) */}
                <div className="flex flex-col gap-6">
                    {/* Subtle Bar Chart Highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group h-full flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <TrendingDown className="w-5 h-5 text-amber-500" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic leading-none">Resumen de Volumen</h4>
                        </div>

                        <div className="space-y-5 flex-1 flex flex-col justify-center">
                            {chartData.slice(0, 4).map((item, idx) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <span className="truncate max-w-[150px]">{item.name}</span>
                                        <div className="bg-slate-900 px-1.5 py-0.5 rounded text-[9px] text-amber-400 font-black">
                                            {((item.value / totalLeadsNoUtil) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / totalLeadsNoUtil) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participación</span>
                                <span className="text-sm font-bold text-slate-700 italic">Top 4 motivos</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </motion.div>

                    {/* Quick Trend Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl flex-1 flex flex-col justify-between"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic leading-none">Análisis de Tendencia</h4>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Últimos 7 días</span>
                                <span className="text-xl font-black text-amber-500">
                                    {data.no_util.reduce((acc, curr) => acc + (curr.leads_7d || 0), 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-slate-200"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Últimos 14 días</span>
                                <span className="text-xl font-black text-slate-900">
                                    {data.no_util.reduce((acc, curr) => acc + (curr.leads_14d || 0), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                            <Star className="w-3 h-3 animate-pulse" />
                            Actualización Automática
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Table Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar subcategoría..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-nods-border rounded-2xl py-3 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all text-sm text-nods-text-primary shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white border border-nods-border rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-nods-text-muted uppercase tracking-[0.2em] border-b border-nods-border">
                                    <th className="px-8 py-5">SUBCATEGORÍA DE DESCARTE</th>
                                    <th className="px-6 py-5 text-center">VOLUMEN LEADS</th>
                                    <th className="px-6 py-5 text-center">% PARTICIPACIÓN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((item, idx) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={item.subcategoria}
                                            className="group hover:bg-slate-50 transition-all cursor-default relative"
                                        >
                                            <td className="px-8 py-6 relative">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-1.5 h-6 rounded-full group-hover:scale-y-125 transition-transform"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-slate-900">
                                                        {item.subcategoria}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center tabular-nums">
                                                <span className="text-sm font-black text-slate-900">
                                                    {item.leads?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 tabular-nums">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="bg-slate-900 px-3 py-1 rounded-lg">
                                                        <span className="text-xs font-black text-amber-400">
                                                            {item.porcentaje}%
                                                        </span>
                                                    </div>
                                                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.porcentaje}%` }}
                                                            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

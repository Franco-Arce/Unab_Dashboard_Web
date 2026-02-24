import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, AlertOctagon, Calendar, Clock, Filter } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from '../components/MetricCard';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

const COLORS = [
    '#F43F5E', '#FB923C', '#FBBF24', '#84CC16', '#10B981',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF'
];

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.noUtil()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!data || !data.no_util) return [];
        return data.no_util.filter(item =>
            (item.subcategoria || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const chartData = useMemo(() => {
        if (!data || !data.no_util) return [];
        const sorted = [...data.no_util].sort((a, b) => b.leads - a.leads);
        const top = sorted.slice(0, 7);
        const others = sorted.slice(7);

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

    const tLeads = filtered.reduce((acc, curr) => acc + (curr.leads || 0), 0);

    const trends = data?.trends || {};

    const cards = [
        { id: 1, label: 'Total No Útiles', value: tLeads, trend: trends.no_util, color: 'from-rose-600 to-rose-900', icon: AlertOctagon, fill: 'h-[40%]' },
    ];

    const handleExport = () => {
        exportToCSV(data.no_util, 'leads_no_util_unab_2026');
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl">
                    <p className="text-xs font-bold text-zinc-400 mb-1">{payload[0].name}</p>
                    <p className="text-lg font-black text-white">
                        {payload[0].value.toLocaleString()}
                        <span className="text-xs font-normal text-zinc-500 ml-2">leads</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 p-4 md:p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <AlertOctagon className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Leads No Útiles</h2>
                    </div>
                    <p className="text-zinc-500 text-sm">Distribución y análisis de subcategorías de descarte.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-2xl text-xs font-bold transition-all shadow-xl group"
                    >
                        <Download className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        Exportar Reporte
                    </button>
                    <div className="h-10 w-px bg-zinc-800 mx-2 hidden md:block" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Última Actualización</span>
                    </div>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <MetricCard data={card} />
                        </motion.div>
                    ))}
                </div>

                {/* Donut Chart Integrated */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-3 bg-[#0f1115] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group"
                >
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        Distribución de Categorías
                    </h3>

                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-white">{tLeads.toLocaleString()}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center leading-tight px-4">
                                Leads<br />Totales
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Table Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filtrar por subcategoría..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:border-rose-500/50 outline-none transition-all text-sm text-zinc-200 shadow-xl"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 px-2">
                        <Filter className="w-3 h-3" />
                        Mostrando {filtered.length} categorías
                    </div>
                </div>

                <div className="bg-[#0f1115] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Subcategoría</th>
                                    <th className="px-6 py-5 text-center">Leads Totales</th>
                                    <th className="px-6 py-5 text-center">% Participación</th>
                                    <th className="px-6 py-5 text-right pr-10">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((item, idx) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={item.subcategoria}
                                            className="group hover:bg-zinc-800/30 transition-all cursor-default"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-1.5 h-6 rounded-full"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                                                        {item.subcategoria}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-zinc-300 group-hover:text-rose-400 transition-colors">
                                                    {item.leads?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="text-xs font-bold text-zinc-400">
                                                        {item.porcentaje}%
                                                    </span>
                                                    <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.porcentaje}%` }}
                                                            className="h-full bg-rose-500"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right pr-10">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${item.leads > 100
                                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                    }`}>
                                                    {item.leads > 100 ? 'Alto Volumen' : 'Regular'}
                                                </span>
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

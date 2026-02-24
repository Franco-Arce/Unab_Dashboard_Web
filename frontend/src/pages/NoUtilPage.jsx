import React, { useState, useEffect } from 'react';
import { Download, Search, AlertOctagon, Calendar, Clock } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';
import { motion } from 'framer-motion';
import { MetricCard } from '../components/MetricCard';

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.noUtil().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    if (!data || !data.no_util) {
        return (
            <div className="h-96 bg-nods-sidebar rounded-3xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                <span className="text-zinc-500 font-bold uppercase tracking-widest">No hay datos de leads no útiles disponibles</span>
            </div>
        );
    }

    const filtered = data.no_util.filter(item =>
        (item.subcategoria || item.descripcion_sub || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(data.no_util, 'leads_no_util_unab_2026');
    };

    let tLeads = 0;
    let tLeads7 = 0;
    let tLeads14 = 0;

    filtered.forEach(p => {
        tLeads += p.leads || 0;
        tLeads7 += p.leads_7d || 0;
        tLeads14 += p.leads_14d || 0;
    });

    const formatPercent = (val, total) => {
        if (!total || total === 0) return '0.00%';
        return `${((val / total) * 100).toFixed(2)}%`;
    };

    const formatTrend = (val) => {
        if (!val) return '0%';
        if (val > 0) return `+${val}%`;
        return `${val}%`;
    };

    const trends = data?.trends || {};

    const cards = [
        { id: 1, label: 'Total No Útiles', value: tLeads, trend: formatTrend(trends.no_util), color: 'from-rose-600 to-rose-800', icon: AlertOctagon, fill: 'h-[40%]' },
        { id: 2, label: '7 Días', value: tLeads7, trend: formatTrend(trends.no_util), color: 'from-orange-500 to-rose-600', icon: Calendar, fill: 'h-[35%]' },
        { id: 3, label: '14 Días', value: tLeads14, trend: formatTrend(trends.no_util), color: 'from-amber-500 to-orange-600', icon: Clock, fill: 'h-[30%]' },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-rose-900 uppercase tracking-[0.3em] mb-2 italic">Leads No Útiles</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-rose-900 to-transparent rounded-full" />
                </div>
            </header>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {cards.map((card, i) => (
                    <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <MetricCard data={card} />
                    </motion.div>
                ))}
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nods-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar subcategoría..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-nods-border rounded-2xl py-2.5 pl-10 pr-4 focus:border-nods-accent outline-none transition-all text-sm text-nods-text-primary shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-nods-accent text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-nods-accent/20"
                    >
                        <Download className="w-3 h-3" /> Exportar
                    </button>
                </div>
            </div>

            <div className="bg-nods-sidebar border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
                <div className="overflow-x-auto rounded-xl border border-zinc-700">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#121826] border-b border-zinc-700 text-[11px] font-bold text-zinc-300">
                                <th className="px-4 py-3 min-w-[200px]">Subcategoría</th>
                                <th className="px-4 py-3 text-center text-amber-500">Leads No Útiles ▼</th>
                                <th className="px-4 py-3 text-center text-amber-500">% No Útil</th>
                                <th className="px-4 py-3 text-center">Leads 7 días</th>
                                <th className="px-4 py-3 text-center">% No Útil</th>
                                <th className="px-4 py-3 text-center">Leads 14 días</th>
                                <th className="px-4 py-3 text-center">% No Útil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 -mt-px">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-xs font-bold">Sin datos para la tabla</td>
                                </tr>
                            )}
                            {filtered.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-4 py-2 text-xs text-zinc-200 font-medium">
                                        <span className="text-zinc-500 inline-block mr-2 w-3">+</span>
                                        {item.subcategoria || item.descripcion_sub}
                                    </td>
                                    <td className="px-4 py-2 text-center text-xs text-amber-500">{item.leads || 0}</td>
                                    <td className="px-4 py-2 text-center text-xs text-amber-500">{formatPercent(item.leads, tLeads)}</td>
                                    <td className="px-4 py-2 text-center text-xs text-zinc-300">{item.leads_7d || 0}</td>
                                    <td className="px-4 py-2 text-center text-xs text-zinc-300">{formatPercent(item.leads_7d, tLeads7)}</td>
                                    <td className="px-4 py-2 text-center text-xs text-zinc-300">{item.leads_14d || 0}</td>
                                    <td className="px-4 py-2 text-center text-xs text-zinc-300">{formatPercent(item.leads_14d, tLeads14)}</td>
                                </tr>
                            ))}
                            {filtered.length > 0 && (
                                <tr className="bg-transparent border-t-2 border-zinc-700">
                                    <td className="px-4 py-3 text-sm font-bold text-white">Total</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-amber-500">{tLeads.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-amber-500">100.00%</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-white">{tLeads7.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-white">{tLeads7 > 0 ? '100.00%' : '0.00%'}</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-white">{tLeads14.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-sm font-bold text-white">{tLeads14 > 0 ? '100.00%' : '0.00%'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

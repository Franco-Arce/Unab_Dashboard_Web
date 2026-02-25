import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CheckCircle, AlertTriangle, XCircle, Minus, Users, UserPlus, CreditCard } from 'lucide-react';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { exportToCSV } from '../utils/export';
import { MetricCard } from '../components/MetricCard';

export default function AdmisionesPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { nivel } = useFilters();

    useEffect(() => {
        setLoading(true);
        api.admisiones(nivel).then(setData).catch(console.error).finally(() => setLoading(false));
    }, [nivel]);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    const filtered = data ? data.programas.filter(p => {
        return p.programa.toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];

    const handleExport = () => {
        exportToCSV(data.programas, 'admisiones_unab_2026');
    };

    const StatusIcon = ({ val }) => {
        const v = parseInt(val) || 0;
        if (v > 0) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (v === 0) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        return <XCircle className="w-4 h-4 text-red-500" />;
    };

    let tSol = 0, tAdm = 0, tPag = 0;
    let tSol25 = 0, tAdm25 = 0, tPag25 = 0;
    let tSolVar = 0, tAdmVar = 0, tPagVar = 0;

    filtered.forEach(p => {
        tSol += p.solicitados || 0;
        tAdm += p.admitidos || 0;
        tPag += p.pagados || 0;
        tSol25 += p.solicitados_25 || 0;
        tAdm25 += p.admitidos_25 || 0;
        tPag25 += p.pagados_25 || 0;
        tSolVar += p.solicitados_var || 0;
        tAdmVar += p.admitidos_var || 0;
        tPagVar += p.pagados_var || 0;
    });

    const calcTrend = (val, total) => {
        const prev = total - val;
        if (prev <= 0) return '+0%';
        const p = ((val / prev) * 100).toFixed(1);
        return p > 0 ? `+${p}%` : `${p}%`;
    };

    const cards = [
        {
            id: 1,
            label: 'Solicitados',
            value: tSol,
            trend: calcTrend(tSolVar, tSol),
            color: 'from-blue-600 to-blue-800',
            icon: Users,
            percentage: tSol25 > 0 ? Math.round((tSol / tSol25) * 100) : 50
        },
        {
            id: 2,
            label: 'Admitidos',
            value: tAdm,
            trend: calcTrend(tAdmVar, tAdm),
            color: 'from-indigo-600 to-blue-700',
            icon: UserPlus,
            percentage: tAdm25 > 0 ? Math.round((tAdm / tAdm25) * 100) : 40
        },
        {
            id: 3,
            label: 'Pagados',
            value: tPag,
            trend: calcTrend(tPagVar, tPag),
            color: 'from-emerald-500 to-teal-600',
            icon: CreditCard,
            percentage: tPag25 > 0 ? Math.round((tPag / tPag25) * 100) : 30
        },
        {
            id: 4,
            label: 'Alcanzado Meta',
            value: tPag25 > 0 ? ((tPag / tPag25) * 100).toFixed(1) + '%' : '0%',
            trend: 'vs 2025',
            color: 'from-cyan-500 to-blue-500',
            icon: CreditCard,
            percentage: tPag25 > 0 ? Math.round((tPag / tPag25) * 100) : 0,
            unit: null
        },
    ];

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-[0.3em] mb-2 italic">Admisiones & Metas</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-900 to-transparent rounded-full" />
                </div>
            </header>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                        placeholder="Buscar programa..."
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

            <div className="bg-nods-sidebar border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-300">
                                <th className="px-4 py-4 w-1/4">Programas</th>
                                <th className="px-2 py-4 text-center border-l-2 border-zinc-800">Solicitados</th>
                                <th className="px-2 py-4 text-center">Admitidos</th>
                                <th className="px-2 py-4 text-center">Pagados</th>
                                <th className="px-2 py-4 text-center border-l-2 border-zinc-800 text-amber-500">Solicitados 25</th>
                                <th className="px-2 py-4 text-center text-amber-500">Admitidos 25</th>
                                <th className="px-2 py-4 text-center text-amber-500">Pagados 25</th>
                                <th className="px-2 py-4 text-center border-l-2 border-zinc-800">Solicitados VAR</th>
                                <th className="px-2 py-4 text-center">Admitidos VAR</th>
                                <th className="px-2 py-4 text-center">Pagados VAR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                            {filtered.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-900 transition-colors">
                                    <td className="px-4 py-3 text-xs font-semibold text-zinc-100 whitespace-normal min-w-[200px] leading-tight break-words">{item.programa}</td>
                                    <td className="px-2 py-3 text-center text-xs text-zinc-300 border-l-2 border-zinc-800">{item.solicitados || ''}</td>
                                    <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.admitidos || ''}</td>
                                    <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.pagados || ''}</td>

                                    <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium border-l-2 border-zinc-800">{item.solicitados_25 || ''}</td>
                                    <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.admitidos_25 || ''}</td>
                                    <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.pagados_25 || ''}</td>

                                    <td className="px-2 py-3 border-l-2 border-zinc-800">
                                        <div className="flex items-center justify-center gap-2">
                                            <StatusIcon val={item.solicitados_var} />
                                            <span className="text-xs text-zinc-300 w-6 text-right">{item.solicitados_var || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <StatusIcon val={item.admitidos_var} />
                                            <span className="text-xs text-zinc-300 w-6 text-right">{item.admitidos_var || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <StatusIcon val={item.pagados_var} />
                                            <span className="text-xs text-zinc-300 w-6 text-right">{item.pagados_var || 0}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length > 0 && (
                                <tr className="bg-[#121826] border-t-2 border-zinc-700">
                                    <td className="px-4 py-4 text-sm font-bold text-white">Total</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white border-l-2 border-zinc-800">{tSol.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tAdm.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tPag.toLocaleString()}</td>

                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500 border-l-2 border-zinc-800">{tSol25 === 0 ? '' : tSol25.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tAdm25 === 0 ? '' : tAdm25.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tPag25 === 0 ? '' : tPag25.toLocaleString()}</td>

                                    <td className="px-2 py-4 text-center text-sm font-bold text-white border-l-2 border-zinc-800">{tSolVar.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tAdmVar.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tPagVar.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

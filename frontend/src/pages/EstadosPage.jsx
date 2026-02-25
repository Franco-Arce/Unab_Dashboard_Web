import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Users, Target, CreditCard, UserCheck } from 'lucide-react';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { exportToCSV } from '../utils/export';
import { MetricCard } from '../components/MetricCard';

export default function EstadosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { nivel } = useFilters();
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ base: '' });

    useEffect(() => {
        setLoading(true);
        api.estados(nivel).then(setData).catch(console.error).finally(() => setLoading(false));
    }, [nivel]);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    const handleExport = () => {
        exportToCSV(data.estados_by_programa, 'estados_gestion_unab_2026');
    };

    const formatPercent = (val) => {
        if (!val || isNaN(val) || val === Infinity) return '0.00%';
        return `${(val * 100).toFixed(2)}%`;
    };

    // Calculate totals for the footer row
    let tLeads = 0, tGestion = 0, tNoUtil = 0, tOpVenta = 0, tProcPago = 0;
    let tSol = 0, tAdm = 0, tPag = 0, tMeta = 0;

    if (data?.estados_by_programa) {
        data.estados_by_programa.forEach(p => {
            tLeads += p.leads || 0;
            tGestion += p.en_gestion || 0;
            tNoUtil += p.no_util || 0;
            tOpVenta += p.op_venta || 0;
            tProcPago += p.proceso_pago || 0;
            tSol += p.solicitados || 0;
            tAdm += p.admitidos || 0;
            tPag += p.pagados || 0;
            tMeta += p.meta || 0;
        });
    }

    const formatTrend = (val) => {
        if (!val) return '0%';
        if (val > 0) return `+${val}%`;
        return `${val}%`;
    };

    const trends = data?.trends || {};

    const cards = [
        {
            id: 1,
            label: 'Total Leads',
            value: tLeads,
            trend: formatTrend(trends.total_leads),
            color: 'from-blue-600 to-blue-800',
            icon: Users,
            percentage: 85
        },
        {
            id: 2,
            label: 'En Gestión',
            value: tGestion,
            trend: formatTrend(trends.en_gestion),
            color: 'from-indigo-600 to-blue-700',
            icon: UserCheck,
            percentage: tLeads > 0 ? Math.round((tGestion / tLeads) * 100) : 0
        },
        {
            id: 3,
            label: 'Op. Venta',
            value: tOpVenta,
            trend: formatTrend(trends.op_venta),
            color: 'from-blue-400 to-indigo-500',
            icon: Target,
            percentage: tGestion > 0 ? Math.round((tOpVenta / tGestion) * 100) : 0
        },
        {
            id: 4,
            label: 'Pagados',
            value: tPag,
            trend: formatTrend(trends.pagados),
            color: 'from-emerald-500 to-teal-600',
            icon: CreditCard,
            percentage: tLeads > 0 ? Math.round((tPag / tLeads) * 100) : 0
        },
    ];

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-[0.3em] mb-2 italic">Estados de Gestión</h2>
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

            <div className="flex justify-end gap-3 relative pt-4">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-nods-accent text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-nods-accent/20"
                >
                    <Download className="w-3 h-3" /> Exportar
                </button>
            </div>

            {/* Programs Detailed States (Matches PowerBI Layout) */}
            <div className="bg-white border border-nods-border rounded-3xl overflow-hidden shadow-xl pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-nods-border text-[11px] font-bold text-nods-text-muted uppercase tracking-wider">
                                <th className="px-4 py-4 w-1/4">PROGRAMAS</th>
                                <th className="px-2 py-4 text-center">LEADS</th>
                                <th className="px-2 py-4 text-center">EN GESTIÓN</th>
                                <th className="px-2 py-4 text-center">NO ÚTIL</th>
                                <th className="px-2 py-4 text-center">OP. VENTA</th>
                                <th className="px-2 py-4 text-center">PROC. PAGO</th>
                                <th className="px-2 py-4 text-center text-cyan-700">SOLICITADOS</th>
                                <th className="px-2 py-4 text-center text-cyan-700">ADMITIDOS</th>
                                <th className="px-2 py-4 text-center text-cyan-700">PAGADOS</th>
                                <th className="px-2 py-4 text-center text-cyan-700">META</th>
                                <th className="px-2 py-4 text-center text-cyan-700">AVANCE</th>
                                <th className="px-2 py-4 text-center text-cyan-700">CONVERSIÓN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 tabular-nums">
                            {data?.estados_by_programa.map((item, idx) => {
                                const avance = item.meta ? (item.pagados / item.meta) : 0;
                                const conversion = item.leads ? (item.pagados / item.leads) : 0;
                                return (
                                    <tr key={idx} className="hover:bg-slate-100/60 transition-all even:bg-slate-50/40 group relative">
                                        <td className="px-4 py-5 text-xs font-semibold text-nods-text-primary whitespace-normal min-w-[200px] leading-tight break-words group-hover:border-l-4 border-indigo-500 transition-all">{item.programa}</td>
                                        <td className="px-2 py-5 text-center text-xs text-nods-text-muted">{item.leads || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-nods-text-muted">{item.en_gestion || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-nods-text-muted">{item.no_util || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-nods-text-muted">{item.op_venta || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-nods-text-muted">{item.proceso_pago || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{item.solicitados || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{item.admitidos || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{item.pagados || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{item.meta || ''}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{formatPercent(avance)}</td>
                                        <td className="px-2 py-5 text-center text-xs text-cyan-700 font-bold">{formatPercent(conversion)}</td>
                                    </tr>
                                );
                            })}
                            {/* Totals Row */}
                            {data?.estados_by_programa.length > 0 && (
                                <tr className="bg-blue-50/50 border-t-2 border-nods-border">
                                    <td className="px-4 py-6 text-sm font-bold text-nods-text-primary">TOTAL GENERAL</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-nods-text-primary">{tLeads.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-nods-text-primary">{tGestion.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-nods-text-primary">{tNoUtil.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-nods-text-primary">{tOpVenta.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-nods-text-primary">{tProcPago === 0 ? '' : tProcPago.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{tSol.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{tAdm.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{tPag.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{tMeta.toLocaleString()}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{formatPercent(tPag / tMeta)}</td>
                                    <td className="px-2 py-6 text-center text-sm font-bold text-cyan-700">{formatPercent(tPag / tLeads)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

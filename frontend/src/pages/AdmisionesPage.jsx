import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CheckCircle, AlertTriangle, XCircle, Minus, Users, UserPlus, CreditCard } from 'lucide-react';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { exportToCSV } from '../utils/export';
import { SummaryCards } from '../components/SummaryCards';

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

    const handleExport = async () => {
        try {
            await api.exportAdmisiones(nivel);
        } catch (error) {
            console.error(error);
            alert('Error al exportar los datos');
        }
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
    let tLeads = 0, tGestion = 0, tOpVenta = 0, tProcPago = 0, tMeta = 0;

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
        tLeads += p.leads || 0;
        tGestion += p.en_gestion || 0;
        tOpVenta += p.op_venta || 0;
        tProcPago += p.proceso_pago || 0;
        tMeta += p.meta || 0;
    });



    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-[0.3em] mb-2 italic">Admisiones & Metas</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-900 to-transparent rounded-full" />
                </div>
            </header>

            {/* KPI Cards */}
            <SummaryCards kpis={{
                total_leads: tLeads,
                en_gestion: tGestion,
                op_venta: tOpVenta,
                proceso_pago: tProcPago,
                pagados: tPag,
                metas: tMeta
            }} />

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

            <div className="bg-white border border-nods-border rounded-3xl overflow-hidden shadow-xl pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            {/* Top group headers */}
                            <tr className="border-b border-nods-border/30">
                                <th rowSpan={2} className="px-4 py-3 text-[11px] font-black text-nods-text-muted uppercase tracking-wider bg-slate-50/50 w-[260px] align-bottom border-r border-nods-border/20">Programa</th>
                                <th colSpan={3} className="px-2 py-2 text-center text-[11px] font-black uppercase tracking-widest bg-blue-50/60 text-blue-800 border-r border-nods-border/20 border-l border-nods-border/20">Solicitados</th>
                                <th colSpan={3} className="px-2 py-2 text-center text-[11px] font-black uppercase tracking-widest bg-cyan-50/60 text-cyan-800 border-r border-nods-border/20">Admitidos</th>
                                <th colSpan={3} className="px-2 py-2 text-center text-[11px] font-black uppercase tracking-widest bg-emerald-50/60 text-emerald-800">Pagados</th>
                            </tr>
                            {/* Sub headers */}
                            <tr className="bg-slate-50/50 border-b border-nods-border text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-2 py-2 text-center border-l border-nods-border/20">Año Ant.</th>
                                <th className="px-2 py-2 text-center font-black text-slate-600">Actual</th>
                                <th className="px-2 py-2 text-center border-r border-nods-border/20">Var %</th>
                                <th className="px-2 py-2 text-center">Año Ant.</th>
                                <th className="px-2 py-2 text-center font-black text-slate-600">Actual</th>
                                <th className="px-2 py-2 text-center border-r border-nods-border/20">Var %</th>
                                <th className="px-2 py-2 text-center">Año Ant.</th>
                                <th className="px-2 py-2 text-center font-black text-slate-600">Actual</th>
                                <th className="px-2 py-2 text-center">Var %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 tabular-nums">
                            {filtered.map((item, idx) => {
                                const VarCell = ({ current, previous }) => {
                                    if (!previous || previous === 0) return <span className="text-slate-300">—</span>;
                                    const pct = (((current - previous) / previous) * 100).toFixed(1);
                                    const isPositive = pct > 0;
                                    const isZero = pct == 0;
                                    return (
                                        <span className={`text-[11px] font-bold ${isZero ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isZero ? '—' : `${isPositive ? '▲' : '▼'} ${Math.abs(pct)}%`}
                                        </span>
                                    );
                                };
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-normal min-w-[200px] leading-tight break-words border-r border-nods-border/10">{item.programa}</td>
                                        {/* Solicitados */}
                                        <td className="px-2 py-3.5 text-center text-xs text-slate-400 border-l border-nods-border/10">{item.solicitados_25 || 0}</td>
                                        <td className="px-2 py-3.5 text-center text-xs font-bold text-slate-800">{item.solicitados || 0}</td>
                                        <td className="px-2 py-3.5 text-center border-r border-nods-border/10"><VarCell current={item.solicitados} previous={item.solicitados_25} /></td>
                                        {/* Admitidos */}
                                        <td className="px-2 py-3.5 text-center text-xs text-slate-400">{item.admitidos_25 || 0}</td>
                                        <td className="px-2 py-3.5 text-center text-xs font-bold text-slate-800">{item.admitidos || 0}</td>
                                        <td className="px-2 py-3.5 text-center border-r border-nods-border/10"><VarCell current={item.admitidos} previous={item.admitidos_25} /></td>
                                        {/* Pagados */}
                                        <td className="px-2 py-3.5 text-center text-xs text-slate-400">{item.pagados_25 || 0}</td>
                                        <td className="px-2 py-3.5 text-center text-xs font-bold text-slate-800">{item.pagados || 0}</td>
                                        <td className="px-2 py-3.5 text-center"><VarCell current={item.pagados} previous={item.pagados_25} /></td>
                                    </tr>
                                );
                            })}
                            {filtered.length > 0 && (
                                <tr className="bg-slate-50 border-t-2 border-slate-200">
                                    <td className="px-4 py-4 text-sm font-black text-slate-900 border-r border-nods-border/10">TOTAL GENERAL</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-slate-400 border-l border-nods-border/10">{tSol25 || '—'}</td>
                                    <td className="px-2 py-4 text-center text-sm font-black text-slate-900">{tSol.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center border-r border-nods-border/10">{tSol25 > 0 ? <span className={`text-xs font-bold ${((tSol - tSol25) / tSol25 * 100) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{((tSol - tSol25) / tSol25 * 100) >= 0 ? '▲' : '▼'} {Math.abs(((tSol - tSol25) / tSol25 * 100)).toFixed(1)}%</span> : <span className="text-slate-300">—</span>}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-slate-400">{tAdm25 || '—'}</td>
                                    <td className="px-2 py-4 text-center text-sm font-black text-slate-900">{tAdm.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center border-r border-nods-border/10">{tAdm25 > 0 ? <span className={`text-xs font-bold ${((tAdm - tAdm25) / tAdm25 * 100) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{((tAdm - tAdm25) / tAdm25 * 100) >= 0 ? '▲' : '▼'} {Math.abs(((tAdm - tAdm25) / tAdm25 * 100)).toFixed(1)}%</span> : <span className="text-slate-300">—</span>}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-slate-400">{tPag25 || '—'}</td>
                                    <td className="px-2 py-4 text-center text-sm font-black text-slate-900">{tPag.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center">{tPag25 > 0 ? <span className={`text-xs font-bold ${((tPag - tPag25) / tPag25 * 100) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{((tPag - tPag25) / tPag25 * 100) >= 0 ? '▲' : '▼'} {Math.abs(((tPag - tPag25) / tPag25 * 100)).toFixed(1)}%</span> : <span className="text-slate-300">—</span>}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

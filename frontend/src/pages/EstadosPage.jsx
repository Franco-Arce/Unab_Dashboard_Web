import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Filter, Users, Target, CreditCard, UserCheck } from 'lucide-react';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { exportToCSV } from '../utils/export';
import { SummaryCards } from '../components/SummaryCards';
import InsightsSection from '../components/InsightsSection';

export default function EstadosPage() {
    const { openAIPanel } = useOutletContext() || {};
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

    const handleExport = async () => {
        try {
            await api.exportEstados(nivel);
        } catch (error) {
            console.error(error);
            alert('Error al exportar los datos');
        }
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



    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-[0.3em] mb-2 italic">Estados de Gestión</h2>
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
                <div className="overflow-x-auto text-[13px]">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-50/80 border-b border-nods-border text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-5 py-4 w-[280px]">Programa</th>
                                <th className="px-2 py-4 text-center">Leads</th>
                                <th className="px-2 py-4 text-center">En Gestión</th>
                                <th className="px-2 py-4 text-center">No Útil</th>
                                <th className="px-2 py-4 text-center">Op. Venta</th>
                                <th className="px-2 py-4 text-center">Proc. Pago</th>
                                <th className="px-2 py-4 text-center">Solicitados</th>
                                <th className="px-2 py-4 text-center">Admitidos</th>
                                <th className="px-2 py-4 text-center">Pagados</th>
                                <th className="px-2 py-4 text-center">Meta</th>
                                <th className="px-2 py-4 text-center">Avance %</th>
                                <th className="px-2 py-4 text-center pr-5">Convers. %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 tabular-nums">
                            {data?.estados_by_programa.map((item, idx) => {
                                const avance = item.meta ? (item.pagados / item.meta) * 100 : 0;
                                const conversion = item.leads ? (item.pagados / item.leads) * 100 : 0;
                                return (
                                    <tr key={idx} className="hover:bg-blue-50/40 transition-all even:bg-slate-50/50 group relative">
                                        <td className="px-5 py-3.5 text-[11px] font-bold text-slate-700 whitespace-normal leading-tight break-words border-r border-slate-100 group-hover:text-nods-accent transition-colors">
                                            {item.programa}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-black text-blue-600">
                                            {item.leads?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-black text-amber-500">
                                            {item.en_gestion?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-black text-red-500">
                                            {item.no_util?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-black text-blue-600">
                                            {item.op_venta?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-bold text-violet-400">
                                            {item.proceso_pago?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-medium text-slate-400">
                                            {item.solicitados?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-medium text-slate-400">
                                            {item.admitidos?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-black text-emerald-500">
                                            {item.pagados?.toLocaleString() || '0'}
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-medium text-slate-400">
                                            {item.meta?.toLocaleString() || '0'}
                                        </td>
                                        <td className={`px-2 py-3.5 text-center font-black ${avance >= 100 ? 'text-emerald-500' : avance > 50 ? 'text-amber-500' : 'text-red-400'}`}>
                                            {avance.toFixed(1)}%
                                        </td>
                                        <td className="px-2 py-3.5 text-center font-medium text-slate-400 pr-5">
                                            {conversion.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Totals Row */}
                            {data?.estados_by_programa.length > 0 && (
                                <tr className="bg-slate-50 border-t-2 border-slate-200">
                                    <td className="px-5 py-5 text-xs font-black text-slate-800">TOTAL GENERAL</td>
                                    <td className="px-2 py-5 text-center text-sm font-black text-blue-700">{tLeads.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-black text-amber-600">{tGestion.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-black text-red-600">{tNoUtil.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-black text-blue-700">{tOpVenta.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-bold text-violet-500">{tProcPago > 0 ? tProcPago.toLocaleString() : '0'}</td>
                                    <td className="px-2 py-5 text-center text-sm font-bold text-slate-500">{tSol.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-bold text-slate-500">{tAdm.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-black text-emerald-600">{tPag.toLocaleString()}</td>
                                    <td className="px-2 py-5 text-center text-sm font-bold text-slate-500">{tMeta.toLocaleString()}</td>
                                    <td className={`px-2 py-5 text-center text-sm font-black ${(tPag / tMeta) >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {((tPag / tMeta) * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-2 py-5 text-center text-sm font-bold text-slate-500 pr-5">
                                        {((tPag / tLeads) * 100).toFixed(2)}%
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Insights */}
            <InsightsSection page="estados" onOpenChat={openAIPanel} />
        </div>
    );
}

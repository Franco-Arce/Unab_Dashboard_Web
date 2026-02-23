import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';

export default function EstadosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ base: '' });

    useEffect(() => {
        api.estados().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

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
    let tSol = 0, tAdm = 0, tPag = 0, tMeta = 0, tToques = 0;
    
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
            tToques += p.toques_prom || 0;
        });
        if (data.estados_by_programa.length > 0) tToques /= data.estados_by_programa.length; // Average of averages
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-3 relative">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-nods-accent text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-nods-accent/20"
                >
                    <Download className="w-3 h-3" /> Exportar
                </button>
            </div>

            {/* Programs Detailed States (Matches PowerBI Layout) */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[11px] font-bold text-zinc-300">
                                <th className="px-4 py-4 w-1/4">Programas</th>
                                <th className="px-2 py-4 text-center">Leads</th>
                                <th className="px-2 py-4 text-center">En Gestión</th>
                                <th className="px-2 py-4 text-center">No Útil</th>
                                <th className="px-2 py-4 text-center">Op. Venta</th>
                                <th className="px-2 py-4 text-center">Proc. Pago</th>
                                <th className="px-2 py-4 text-center text-amber-500">Solicitados</th>
                                <th className="px-2 py-4 text-center text-amber-500">Admitidos</th>
                                <th className="px-2 py-4 text-center text-amber-500">Pagados</th>
                                <th className="px-2 py-4 text-center text-amber-500">Meta</th>
                                <th className="px-2 py-4 text-center text-amber-500">Avance</th>
                                <th className="px-2 py-4 text-center text-amber-500">Conversión</th>
                                <th className="px-4 py-4 text-center">Toques Prom.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                            {data?.estados_by_programa.map((item, idx) => {
                                const avance = item.meta ? (item.pagados / item.meta) : 0;
                                const conversion = item.leads ? (item.pagados / item.leads) : 0;
                                return (
                                    <tr key={idx} className="hover:bg-zinc-900 transition-colors">
                                        <td className="px-4 py-3 text-xs font-semibold text-zinc-100 whitespace-normal min-w-[200px] leading-tight break-words">{item.programa}</td>
                                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.leads || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.en_gestion || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.no_util || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.op_venta || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{item.proceso_pago || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.solicitados || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.admitidos || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.pagados || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{item.meta || ''}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{formatPercent(avance)}</td>
                                        <td className="px-2 py-3 text-center text-xs text-amber-500 font-medium">{formatPercent(conversion)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-zinc-300">{(item.toques_prom || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            {/* Totals Row */}
                            {data?.estados_by_programa.length > 0 && (
                                <tr className="bg-zinc-900 border-t-2 border-zinc-700">
                                    <td className="px-4 py-4 text-sm font-bold text-white">Total</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tLeads.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tGestion.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tNoUtil.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tOpVenta.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-white">{tProcPago === 0 ? '' : tProcPago.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tSol.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tAdm.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tPag.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{tMeta.toLocaleString()}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{formatPercent(tPag/tMeta)}</td>
                                    <td className="px-2 py-4 text-center text-sm font-bold text-amber-500">{formatPercent(tPag/tLeads)}</td>
                                    <td className="px-4 py-4 text-center text-sm font-bold text-white">{tToques.toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

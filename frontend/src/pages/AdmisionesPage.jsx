import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';

export default function AdmisionesPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.admisiones().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    const filtered = data.programas.filter(p =>
        p.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(data.programas, 'admisiones_unab_2026');
    };

    const getVarIndicator = (val) => {
        const v = parseInt(val) || 0;
        if (v > 0) return <div className="p-1 bg-emerald-50 rounded-lg"><TrendingUp className="w-3 h-3 text-emerald-600" /></div>;
        if (v < 0) return <div className="p-1 bg-red-50 rounded-lg"><TrendingDown className="w-3 h-3 text-red-600" /></div>;
        return <div className="p-1 bg-slate-50 rounded-lg"><Minus className="w-3 h-3 text-nods-text-muted" /></div>;
    };

    const getVarColor = (val) => {
        const v = parseInt(val) || 0;
        if (v > 0) return 'text-emerald-600 font-bold';
        if (v < 0) return 'text-red-600 font-bold';
        return 'text-nods-text-muted';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-nods-border rounded-xl text-xs font-bold text-nods-text-primary hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-3 h-3" /> Filtros
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-nods-accent text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-nods-accent/20"
                    >
                        <Download className="w-3 h-3" /> Exportar
                    </button>
                </div>
            </div>

            <div className="bg-nods-card border border-nods-border rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-nods-border text-[10px] font-bold text-nods-text-muted uppercase tracking-widest">
                                <th className="px-6 py-4">Programa</th>
                                <th className="px-6 py-4 text-center">Solicitados</th>
                                <th className="px-6 py-4 text-center">Admitidos</th>
                                <th className="px-6 py-4 text-center">Pagados</th>
                                <th className="px-6 py-4 text-center text-nods-accent">Solicitados AA</th>
                                <th className="px-6 py-4 text-center text-nods-accent">Admitidos AA</th>
                                <th className="px-6 py-4 text-center text-nods-accent">Pagados AA</th>
                                <th className="px-6 py-4 text-center bg-slate-100/30">Var Sol.</th>
                                <th className="px-6 py-4 text-center bg-slate-100/30">Var Adm.</th>
                                <th className="px-6 py-4 text-center bg-slate-100/30">Var Pag.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filtered.map((item, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-nods-text-primary group-hover:text-nods-accent transition-colors">{item.programa}</div>
                                        <div className="text-[10px] text-nods-text-muted mt-1 uppercase font-bold tracking-wider">{item.anio} Meta: {item.metas}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-nods-text-primary">{item.solicitados || 0}</td>
                                    <td className="px-6 py-4 text-center font-medium text-nods-text-primary">{item.admitidos || 0}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{item.pagados || 0}</td>
                                    <td className="px-6 py-4 text-center text-nods-text-muted">{item.solicitados_aa || '-'}</td>
                                    <td className="px-6 py-4 text-center text-nods-text-muted">{item.admitidos_aa || '-'}</td>
                                    <td className="px-6 py-4 text-center text-nods-text-muted">{item.pagados_aa || '-'}</td>
                                    <td className="px-6 py-4 bg-slate-50/50">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.solicitados_var)}`}>{item.solicitados_var || 0}</span>
                                            {getVarIndicator(item.solicitados_var)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-slate-50">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.admitidos_var)}`}>{item.admitidos_var || 0}</span>
                                            {getVarIndicator(item.admitidos_var)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-slate-50/50">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.pagados_var)}`}>{item.pagados_var || 0}</span>
                                            {getVarIndicator(item.pagados_var)}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-slate-50 font-black text-nods-text-primary border-t-2 border-nods-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                <td className="px-6 py-5 uppercase tracking-widest text-[10px]">Total General</td>
                                <td className="px-6 py-5 text-center text-lg">{data.totals.solicitados}</td>
                                <td className="px-6 py-5 text-center text-lg">{data.totals.admitidos}</td>
                                <td className="px-6 py-5 text-center text-nods-accent">{data.totals.pagados}</td>
                                <td className="px-6 py-5 text-center text-nods-text-muted" colSpan={3}></td>
                                <td className="px-6 py-5 text-center bg-slate-100/50" colSpan={3}>Meta Total: {data.totals.metas}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

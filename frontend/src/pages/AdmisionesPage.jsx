import React, { useState, useEffect } from 'react';
import {
    Table,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Download,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export default function AdmisionesPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.admisiones().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-zinc-900 animate-pulse rounded-3xl" />;

    const filtered = data.programas.filter(p =>
        p.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getVarIndicator = (val) => {
        const v = parseInt(val) || 0;
        if (v > 0) return <div className="p-1 bg-emerald-500/10 rounded-lg"><TrendingUp className="w-3 h-3 text-emerald-500" /></div>;
        if (v < 0) return <div className="p-1 bg-red-500/10 rounded-lg"><TrendingDown className="w-3 h-3 text-red-500" /></div>;
        return <div className="p-1 bg-zinc-800 rounded-lg"><Minus className="w-3 h-3 text-zinc-500" /></div>;
    };

    const getVarColor = (val) => {
        const v = parseInt(val) || 0;
        if (v > 0) return 'text-emerald-400';
        if (v < 0) return 'text-red-400';
        return 'text-zinc-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar programa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2 pl-10 pr-4 focus:border-primary outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">
                        <Filter className="w-3 h-3" /> Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl text-xs font-bold hover:bg-amber-400 transition-all">
                        <Download className="w-3 h-3" /> Exportar
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-zinc-950 border-b border-zinc-800">
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Programa</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest text-center">Solicitados</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest text-center">Admitidos</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest text-center">Pagados</th>
                                <th className="px-6 py-4 font-bold text-primary uppercase text-[10px] tracking-widest text-center">Solicitados AA</th>
                                <th className="px-6 py-4 font-bold text-primary uppercase text-[10px] tracking-widest text-center">Admitidos AA</th>
                                <th className="px-6 py-4 font-bold text-primary uppercase text-[10px] tracking-widest text-center">Pagados AA</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-center bg-zinc-900/40">Var Sol.</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-center bg-zinc-900/40">Var Adm.</th>
                                <th className="px-6 py-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-center bg-zinc-900/40">Var Pag.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filtered.map((item, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-zinc-800/30 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-100 group-hover:text-primary transition-colors">{item.programa}</div>
                                        <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">{item.anio} Meta: {item.metas}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">{item.solicitados || 0}</td>
                                    <td className="px-6 py-4 text-center font-medium">{item.admitidos || 0}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-400">{item.pagados || 0}</td>
                                    <td className="px-6 py-4 text-center text-zinc-500">{item.solicitados_aa || '-'}</td>
                                    <td className="px-6 py-4 text-center text-zinc-500">{item.admitidos_aa || '-'}</td>
                                    <td className="px-6 py-4 text-center text-zinc-500">{item.pagados_aa || '-'}</td>
                                    <td className="px-6 py-4 bg-zinc-900/20">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.solicitados_var)}`}>{item.solicitados_var || 0}</span>
                                            {getVarIndicator(item.solicitados_var)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-zinc-900/20">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.admitidos_var)}`}>{item.admitidos_var || 0}</span>
                                            {getVarIndicator(item.admitidos_var)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 bg-zinc-900/20">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-xs font-bold ${getVarColor(item.pagados_var)}`}>{item.pagados_var || 0}</span>
                                            {getVarIndicator(item.pagados_var)}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-zinc-950 font-black text-white border-t-2 border-zinc-800">
                                <td className="px-6 py-5 uppercase tracking-widest text-[10px]">Total General</td>
                                <td className="px-6 py-5 text-center text-lg">{data.totals.solicitados}</td>
                                <td className="px-6 py-5 text-center text-lg">{data.totals.admitidos}</td>
                                <td className="px-6 py-5 text-center text-lg text-primary">{data.totals.pagados}</td>
                                <td className="px-6 py-5 text-center text-zinc-500" colSpan={3}></td>
                                <td className="px-6 py-5 text-center bg-zinc-900/40" colSpan={3}>Meta Total: {data.totals.metas}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

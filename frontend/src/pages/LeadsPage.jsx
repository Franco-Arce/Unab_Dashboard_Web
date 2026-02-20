import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    MessageSquare,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ base: '', programa: '' });

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.leads({ page, search, ...filters });
            setLeads(res.data);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchLeads, 500);
        return () => clearTimeout(timeout);
    }, [page, search, filters]);

    const totalPages = Math.ceil(total / 25);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all flex-1 md:flex-none">
                        <Filter className="w-4 h-4" /> Filtros Avanzados
                    </button>
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-4 py-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{total.toLocaleString()} leads</span>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Programa</th>
                                <th className="px-6 py-4">Estado / Gestión</th>
                                <th className="px-6 py-4">Toques</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-zinc-800 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : (
                                leads.map((lead, idx) => (
                                    <motion.tr
                                        key={lead.idinterno}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="hover:bg-zinc-800/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-primary group-hover:text-black transition-all">
                                                    {lead.txtnombreapellido?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-100">{lead.txtnombreapellido}</div>
                                                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {lead.emlmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-zinc-300 max-w-[200px] truncate">{lead.txtprogramainteres}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{lead.base}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.ultima_mejor_subcat_string ? (
                                                <div className="inline-flex flex-col">
                                                    <span className="text-xs font-bold text-emerald-400">{lead.ultima_mejor_subcat_string}</span>
                                                    <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{lead.descrip_subcat}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-600 italic">Sin gestión</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                <span className="font-bold">{lead.cant_toques_call_crm || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-zinc-400">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-xs">{lead.fecha_a_utilizar ? new Date(lead.fecha_a_utilizar).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-primary">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                        Página {page} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-zinc-800 rounded-xl disabled:opacity-30 disabled:grayscale hover:bg-zinc-800 transition-all font-bold"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 px-2">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pNum = i + 1; // Simplified pagination for demo
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(pNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pNum ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-zinc-800 rounded-xl disabled:opacity-30 disabled:grayscale hover:bg-zinc-800 transition-all font-bold"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

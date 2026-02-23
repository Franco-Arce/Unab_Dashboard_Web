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
    const [showFilters, setShowFilters] = useState(false);
    const [availableBases, setAvailableBases] = useState([]);

    useEffect(() => {
        api.bases().then(setAvailableBases).catch(console.error);
    }, []);

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

    const resetFilters = () => {
        setFilters({ base: '', programa: '' });
        setShowFilters(false);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nods-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-white border border-nods-border rounded-2xl py-3 pl-12 pr-4 focus:border-nods-accent focus:ring-1 focus:ring-nods-accent outline-none transition-all shadow-sm text-nods-text-primary"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-2xl text-sm font-bold transition-all flex-1 md:flex-none ${showFilters ? 'bg-nods-accent text-white border-nods-accent shadow-md shadow-nods-accent/20' : 'bg-white border-nods-border text-nods-text-primary hover:bg-slate-50'}`}
                    >
                        <Filter className="w-4 h-4" /> Filtros Avanzados
                    </button>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-16 w-80 bg-white border border-nods-border rounded-3xl p-6 shadow-2xl z-50 space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-nods-text-muted uppercase tracking-widest">Base de Datos</label>
                                    <select
                                        value={filters.base}
                                        onChange={(e) => { setFilters({ ...filters, base: e.target.value }); setPage(1); }}
                                        className="w-full bg-nods-bg border border-nods-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-nods-accent text-nods-text-primary"
                                    >
                                        <option value="">Todas las bases</option>
                                        {availableBases.map((b, idx) => (
                                            <option key={idx} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-nods-text-muted uppercase tracking-widest">Programa</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Derecho..."
                                        value={filters.programa}
                                        onChange={(e) => { setFilters({ ...filters, programa: e.target.value }); setPage(1); }}
                                        className="w-full bg-nods-bg border border-nods-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-nods-accent text-nods-text-primary"
                                    />
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="flex-1 bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-nods-text-primary hover:bg-slate-200 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={resetFilters}
                                        className="flex-1 bg-red-400/10 text-red-400 py-2.5 rounded-xl text-xs font-bold hover:bg-red-400/20 transition-all"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 bg-white border border-nods-border rounded-2xl px-4 py-3 shadow-sm">
                        <span className="text-xs font-bold text-nods-text-muted uppercase tracking-widest">{total.toLocaleString()} leads</span>
                    </div>
                </div>
            </div>

            <div className="bg-nods-sidebar border border-nods-border rounded-3xl overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#121826] border-b border-nods-border text-[10px] font-bold text-nods-text-muted uppercase tracking-widest sticky top-0 z-10">
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
                                        <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-slate-100 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : (
                                leads.map((lead, idx) => (
                                    <motion.tr
                                        key={lead.idinterno}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="hover:bg-[#121826] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-nods-bg flex items-center justify-center font-bold text-nods-text-muted group-hover:bg-nods-accent group-hover:text-white transition-all shadow-sm">
                                                    {lead.txtnombreapellido?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-nods-text-primary">{lead.txtnombreapellido}</div>
                                                    <div className="text-xs text-nods-text-muted flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {lead.emlmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-nods-text-primary max-w-[200px] truncate">{lead.txtprogramainteres}</div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold">{lead.base}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.ultima_mejor_subcat_string ? (
                                                <div className="inline-flex flex-col">
                                                    <span className="text-xs font-extrabold text-emerald-600">{lead.ultima_mejor_subcat_string}</span>
                                                    <span className="text-[10px] text-nods-text-muted truncate max-w-[150px]">{lead.descrip_subcat}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-nods-text-muted italic">Sin gestión</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-nods-accent shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                                <span className="font-bold text-nods-text-primary">{lead.cant_toques_call_crm || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-nods-text-muted">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-xs font-medium">{lead.fecha_a_utilizar ? new Date(lead.fecha_a_utilizar).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-nods-text-muted hover:text-nods-accent">
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
                <div className="p-6 border-t border-nods-border bg-nods-sidebar flex items-center justify-between">
                    <div className="text-xs text-nods-text-muted font-bold uppercase tracking-widest">
                        Página {page} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-nods-border bg-white rounded-xl disabled:opacity-30 disabled:grayscale hover:bg-slate-50 transition-all font-bold shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4 text-nods-text-primary" />
                        </button>
                        <div className="flex items-center gap-1 px-2">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pNum = i + 1; // Simplified pagination for demo
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(pNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pNum ? 'bg-nods-accent text-white shadow-md shadow-nods-accent/20' : 'text-nods-text-muted hover:text-nods-accent hover:bg-slate-100'}`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-nods-border bg-white rounded-xl disabled:opacity-30 disabled:grayscale hover:bg-slate-50 transition-all font-bold shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4 text-nods-text-primary" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    ExternalLink,
    Copy,
    X,
    Check,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import { MetricCard } from '../components/MetricCard';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ base: '', programa: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [availableBases, setAvailableBases] = useState([]);
    const { nivel } = useFilters();

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleCopyInfo = async () => {
        if (!selectedLead) return;
        const infoToCopy = `Nombre: ${selectedLead.txtnombreapellido || 'N/A'}\n` +
            `ID Interno: ${selectedLead.idinterno || 'N/A'}\n` +
            `Email: ${selectedLead.emlmail || 'N/A'}\n` +
            `Teléfono: ${selectedLead.teltelefono || 'N/A'}\n` +
            `Programa: ${selectedLead.txtprogramainteres || 'N/A'}\n` +
            `Base: ${selectedLead.base || 'N/A'}\n` +
            `Estado/Gestión: ${selectedLead.ultima_mejor_subcat_string || 'Sin Gestión'} - ${selectedLead.descrip_subcat || ''}\n` +
            `Fecha a utilizar: ${selectedLead.fecha_a_utilizar ? new Date(selectedLead.fecha_a_utilizar).toLocaleDateString() : 'N/A'}\n` +
            `Fecha creación op: ${selectedLead.feccreacionoportunidad ? new Date(selectedLead.feccreacionoportunidad).toLocaleDateString() : 'N/A'}`;

        try {
            await navigator.clipboard.writeText(infoToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy info:', err);
        }
    };

    useEffect(() => {
        api.bases().then(setAvailableBases).catch(console.error);
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.leads({ page, search, nivel, ...filters });
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
    }, [page, search, filters, nivel]);

    useEffect(() => {
        setPage(1);
    }, [nivel]);

    const totalPages = Math.ceil(total / 25);

    const resetFilters = () => {
        setFilters({ base: '', programa: '' });
        setShowFilters(false);
        setPage(1);
    };

    const card = {
        id: 1,
        label: 'Resultados Encontrados',
        value: total,
        trend: '+0%',
        color: 'from-blue-600 to-indigo-700',
        icon: Users,
        percentage: 75
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-[0.3em] mb-2 italic">Explorador de Leads</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-900 to-transparent rounded-full" />
                </div>
            </header>

            {/* KPI Section */}
            <div className="max-w-xs transition-all duration-500">
                <MetricCard data={card} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4">
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
                </div>
            </div>

            <div className="bg-white border border-nods-border rounded-3xl overflow-hidden min-h-[600px] flex flex-col shadow-xl">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-nods-border text-[10px] font-bold text-nods-text-muted uppercase tracking-widest sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">CONTACTO</th>
                                <th className="px-6 py-4">PROGRAMA</th>
                                <th className="px-6 py-4">ESTADO / GESTIÓN</th>
                                <th className="px-6 py-4">FECHA</th>
                                <th className="px-6 py-4">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-slate-50 rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : (
                                leads.map((lead, idx) => (
                                    <motion.tr
                                        key={lead.idinterno}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="hover:bg-slate-100/60 transition-all group relative even:bg-slate-50/30"
                                    >
                                        <td className="relative px-6 py-6 ring-0 group-hover:ring-l-4 ring-nods-accent transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-nods-text-muted group-hover:bg-nods-accent group-hover:text-white transition-all shadow-sm">
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
                                        <td className="px-6 py-6">
                                            <div className="text-xs font-medium text-nods-text-primary max-w-[200px] truncate">{lead.txtprogramainteres}</div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold">{lead.base}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {lead.ultima_mejor_subcat_string ? (
                                                <div className="inline-flex flex-col">
                                                    <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-tight">{lead.ultima_mejor_subcat_string}</span>
                                                    <span className="text-[10px] text-nods-text-muted truncate max-w-[150px]">{lead.descrip_subcat}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-nods-text-muted italic">Sin gestión</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-1 text-nods-text-muted tabular-nums">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-xs font-medium">{lead.fecha_a_utilizar ? new Date(lead.fecha_a_utilizar).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="p-2 hover:bg-white rounded-xl transition-all text-nods-text-muted hover:text-nods-accent shadow-sm border border-transparent hover:border-slate-100"
                                            >
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
                <div className="p-6 border-t border-nods-border bg-slate-50/30 flex items-center justify-between">
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
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pNum ? 'bg-nods-accent text-white shadow-md shadow-nods-accent/20' : 'text-nods-text-muted hover:text-nods-text-primary hover:bg-slate-100'}`}
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

            {/* Lead Details Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                        onClick={() => setSelectedLead(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white border border-nods-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-nods-border flex items-center justify-between">
                                <h2 className="text-lg font-bold text-nods-text-primary">Detalles del Lead</h2>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="p-2 text-nods-text-muted hover:text-nods-text-primary hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">Contacto</div>
                                            <div className="text-sm font-bold text-nods-text-primary">{selectedLead.txtnombreapellido || '-'}</div>
                                            <div className="text-sm text-nods-text-muted flex items-center gap-1.5 mt-1">
                                                <Mail className="w-3.5 h-3.5" /> {selectedLead.emlmail || '-'}
                                            </div>
                                            <div className="text-sm text-nods-text-muted flex items-center gap-1.5 mt-1">
                                                <Phone className="w-3.5 h-3.5" /> {selectedLead.teltelefono || 'Sin teléfono'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">ID Interno / Base</div>
                                            <div className="text-sm text-nods-text-primary font-medium">{selectedLead.idinterno || '-'}</div>
                                            <div className="text-xs text-nods-text-muted">{selectedLead.base || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">Programa de Interés</div>
                                            <div className="text-sm font-bold text-nods-text-primary leading-tight">{selectedLead.txtprogramainteres || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">Estado de Gestión</div>
                                            {selectedLead.ultima_mejor_subcat_string ? (
                                                <div className="inline-flex flex-col mt-0.5">
                                                    <span className="text-sm font-extrabold text-emerald-600">{selectedLead.ultima_mejor_subcat_string}</span>
                                                    <span className="text-xs text-nods-text-muted">{selectedLead.descrip_subcat}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-amber-600 italic font-medium">Sin gestión</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">Creación Op.</div>
                                                <div className="text-sm text-nods-text-primary">
                                                    {selectedLead.feccreacionoportunidad ? new Date(selectedLead.feccreacionoportunidad).toLocaleDateString() : '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-nods-text-muted uppercase tracking-widest font-bold mb-1">A Utilizar</div>
                                                <div className="text-sm text-nods-text-primary">
                                                    {selectedLead.fecha_a_utilizar ? new Date(selectedLead.fecha_a_utilizar).toLocaleDateString() : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-nods-border flex justify-end gap-3">
                                <button
                                    onClick={handleCopyInfo}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${copied
                                        ? 'bg-nods-success text-white shadow-lg shadow-nods-success/20'
                                        : 'bg-nods-accent text-white hover:bg-blue-600 shadow-lg shadow-nods-accent/20'
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? '¡Copiado!' : 'Copiar Información'}
                                </button>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="px-4 py-2.5 bg-white text-nods-text-primary rounded-xl text-xs font-bold hover:bg-slate-50 transition-all border border-nods-border shadow-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

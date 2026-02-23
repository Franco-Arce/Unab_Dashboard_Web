import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { XCircle, Info, Filter, Download, Search } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.noUtil().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    if (!data || !data.no_util || !Array.isArray(data.no_util)) {
        return (
            <div className="h-96 bg-white rounded-3xl flex items-center justify-center border border-nods-border shadow-2xl">
                <span className="text-nods-text-muted font-bold uppercase tracking-widest">No hay datos de leads no útiles disponibles</span>
            </div>
        );
    }

    const filtered = data.no_util.filter(item =>
        (item.descripcion_sub || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(data.no_util, 'leads_no_util_unab_2026');
    };

    const COLORS = ['#f5bc02', '#3b82f6', '#10b981', '#f43f5e', '#ec4899', '#a855f7', '#fb923c', '#94a3b8'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nods-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar subcategoría..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-nods-border rounded-2xl py-2.5 pl-10 pr-4 focus:border-nods-accent outline-none transition-all text-sm text-nods-text-primary shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-nods-accent text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-nods-accent/20"
                    >
                        <Download className="w-3 h-3" /> Exportar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <div className="bg-white border border-nods-border rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between w-full text-nods-text-primary">
                        Distribución No Útil
                        <XCircle className="w-5 h-5 text-red-500" />
                    </h3>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.no_util.slice(0, 10)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="cnt"
                                    nameKey="descripcion_sub"
                                    isAnimationActive={false}
                                >
                                    {data.no_util.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 text-center bg-red-50 p-6 rounded-3xl border border-red-100 w-full">
                        <div className="text-4xl font-black text-red-600">{data.no_util_total.toLocaleString()}</div>
                        <div className="text-xs font-bold text-nods-text-muted uppercase tracking-widest mt-1">Leads No Útiles Totales</div>
                    </div>
                </div>

                {/* Subcategories List */}
                <div className="bg-white border border-nods-border rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between text-nods-text-primary">
                        Detalle de Subcategorías
                        <Info className="w-5 h-5 text-nods-text-muted" />
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filtered.map((item, idx) => {
                            const porcentaje = Math.round((item.cnt / data.no_util_total) * 100) || 0;
                            return (
                                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-nods-border hover:border-nods-accent/20 transition-all group shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-nods-text-primary group-hover:text-nods-accent transition-colors">{item.descripcion_sub}</span>
                                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">{porcentaje}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${porcentaje}%` }}
                                            transition={{ duration: 1, delay: idx * 0.05 }}
                                            className="h-full bg-slate-400 group-hover:bg-nods-accent transition-all"
                                        />
                                    </div>
                                    <div className="mt-2 text-[10px] font-bold text-nods-text-muted uppercase tracking-widest">
                                        {item.cnt} Leads
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
}

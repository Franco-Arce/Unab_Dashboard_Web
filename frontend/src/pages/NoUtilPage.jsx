import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { XCircle, Info, Filter, Download, Search } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';
import AIPanel from '../components/AIPanel';

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.noUtil().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-zinc-900 animate-pulse rounded-3xl" />;

    const filtered = data.no_util.filter(item =>
        item.descripcion_sub.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(data.no_util, 'leads_no_util_unab_2026');
    };

    const COLORS = ['#f5bc02', '#3b82f6', '#10b981', '#f43f5e', '#ec4899', '#a855f7', '#fb923c', '#94a3b8'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Buscar subcategoría..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 focus:border-primary outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl text-xs font-bold hover:bg-amber-400 transition-all shadow-lg shadow-primary/10"
                    >
                        <Download className="w-3 h-3" /> Exportar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between w-full">
                        Distribución No Útil
                        <XCircle className="w-5 h-5 text-red-400" />
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 text-center bg-red-400/5 p-6 rounded-3xl border border-red-400/10 w-full">
                        <div className="text-4xl font-black text-red-400">{data.no_util_total.toLocaleString()}</div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Leads No Útiles Totales</div>
                    </div>
                </div>

                {/* Subcategories List */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                        Detalle de Subcategorías
                        <Info className="w-5 h-5 text-zinc-500" />
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filtered.map((item, idx) => {
                            const porcentaje = Math.round((item.cnt / data.no_util_total) * 100) || 0;
                            return (
                                <div key={idx} className="bg-black/30 p-4 rounded-2xl border border-zinc-800/50 hover:border-primary/20 transition-all group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-zinc-200 group-hover:text-primary transition-colors">{item.descripcion_sub}</span>
                                        <span className="text-xs font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg">{porcentaje}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${porcentaje}%` }}
                                            transition={{ duration: 1, delay: idx * 0.05 }}
                                            className="h-full bg-zinc-400 group-hover:bg-primary transition-all"
                                        />
                                    </div>
                                    <div className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {item.cnt} Leads
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <AIPanel />
            </div>
        </div>
    );
}

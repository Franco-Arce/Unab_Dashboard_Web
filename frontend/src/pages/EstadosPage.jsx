import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Target, CheckCircle2, Download, Filter } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';
import AIPanel from '../components/AIPanel';

export default function EstadosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.estados().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-zinc-900 animate-pulse rounded-3xl" />;

    const handleExport = () => {
        exportToCSV(data.estados_by_programa, 'estados_gestion_unab_2026');
    };

    const getProgressionColor = (val, meta) => {
        const perc = (val / meta) * 100;
        if (perc >= 100) return 'text-emerald-400';
        if (perc >= 70) return 'text-primary';
        if (perc >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">
                    <Filter className="w-3 h-3" /> Filtros
                </button>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl text-xs font-bold hover:bg-amber-400 transition-all shadow-lg shadow-primary/10"
                >
                    <Download className="w-3 h-3" /> Exportar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gauge / Cumplimiento Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-8 text-center w-full flex items-center justify-between">
                        Cumplimiento Objetivo Matrículas
                        <Target className="w-5 h-5 text-primary" />
                    </h3>

                    <div className="relative w-64 h-32 overflow-hidden mb-6">
                        <div className="absolute inset-x-0 top-0 w-64 h-64 border-[24px] border-zinc-800 rounded-full" />
                        <motion.div
                            initial={{ rotate: -90 }}
                            animate={{ rotate: -90 + (180 * Math.min(data.totals.pagados / data.totals.metas, 1)) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-x-0 top-0 w-64 h-64 border-[24px] border-primary border-t-transparent border-l-transparent rounded-full"
                        />
                        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                            <span className="text-4xl font-black">{data.totals.pagados}</span>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Matriculados de {data.totals.metas}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full mt-4">
                        <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800 text-center">
                            <div className="text-2xl font-black text-primary">{Math.round((data.totals.pagados / data.totals.metas) * 100)}%</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Alcance Objetivo</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800 text-center">
                            <div className="text-2xl font-black text-emerald-400">{data.totals.metas - data.totals.pagados}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Restantes para Meta</div>
                        </div>
                    </div>
                </div>

                {/* Gestion Distribution */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                        Estados de Gestión
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </h3>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.estados_gestion.slice(0, 8)} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="gestion" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} width={120} />
                                <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="#f5bc02" barSize={15} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Programs Detailed States */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Desglose por Programa</h3>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                        <span className="w-2 h-2 rounded-full bg-primary" /> En Gestión
                        <span className="w-2 h-2 rounded-full bg-red-400 ml-2" /> No Útil
                        <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2" /> Pagados
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Programa</th>
                                <th className="px-6 py-4 text-center">Leads</th>
                                <th className="px-6 py-4 text-center">Gestión</th>
                                <th className="px-6 py-4 text-center">No Útil</th>
                                <th className="px-6 py-4 text-center">Op. Venta</th>
                                <th className="px-6 py-4 text-center">Págados</th>
                                <th className="px-6 py-4 text-center">Avance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {data.estados_by_programa.map((item, idx) => {
                                const meta = 50;
                                return (
                                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-bold">{item.programa}</td>
                                        <td className="px-6 py-4 text-center">{item.leads}</td>
                                        <td className="px-6 py-4 text-center text-primary">{item.en_gestion}</td>
                                        <td className="px-6 py-4 text-center text-red-400">{item.no_util}</td>
                                        <td className="px-6 py-4 text-center">{item.op_venta}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-400">{item.proceso_pago}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${Math.min((item.proceso_pago / meta) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold w-10 text-right ${getProgressionColor(item.proceso_pago, meta)}`}>
                                                    {Math.round((item.proceso_pago / meta) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="pt-8">
                <AIPanel />
            </div>
        </div>
    );
}

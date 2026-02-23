import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Target, CheckCircle2, Download, Filter } from 'lucide-react';
import api from '../api';
import { exportToCSV } from '../utils/export';

export default function EstadosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.estados().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-white animate-pulse rounded-3xl border border-nods-border shadow-2xl" />;

    const handleExport = () => {
        exportToCSV(data.estados_by_programa, 'estados_gestion_unab_2026');
    };

    const getProgressionColor = (val, meta) => {
        const perc = (val / meta) * 100;
        if (perc >= 100) return 'text-nods-success';
        if (perc >= 70) return 'text-nods-accent';
        if (perc >= 40) return 'text-nods-warning';
        return 'text-red-600';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-3">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gauge / Cumplimiento Section */}
                <div className="bg-white border border-nods-border rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <h3 className="text-xl font-bold mb-8 text-center w-full flex items-center justify-between text-nods-text-primary">
                        Cumplimiento Objetivo Matrículas
                        <Target className="w-5 h-5 text-nods-accent" />
                    </h3>

                    <div className="relative w-64 h-32 overflow-hidden mb-6">
                        <div className="absolute inset-x-0 top-0 w-64 h-64 border-[24px] border-slate-100 rounded-full" />
                        <motion.div
                            initial={{ rotate: -90 }}
                            animate={{ rotate: -90 + (180 * Math.min(data.totals.pagados / data.totals.metas, 1)) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-x-0 top-0 w-64 h-64 border-[24px] border-nods-accent border-t-transparent border-l-transparent rounded-full"
                        />
                        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                            <span className="text-4xl font-black text-nods-text-primary">{data.totals.pagados}</span>
                            <span className="text-xs font-bold text-nods-text-muted uppercase tracking-widest mt-1">Matriculados de {data.totals.metas}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 w-full mt-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-nods-border text-center shadow-sm">
                            <div className="text-2xl font-black text-nods-accent">{Math.round((data.totals.pagados / data.totals.metas) * 100)}%</div>
                            <div className="text-[10px] font-bold text-nods-text-muted uppercase tracking-tighter">Alcance Objetivo</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-nods-border text-center shadow-sm">
                            <div className="text-2xl font-black text-nods-success">{data.totals.metas - data.totals.pagados}</div>
                            <div className="text-[10px] font-bold text-nods-text-muted uppercase tracking-tighter">Restantes para Meta</div>
                        </div>
                    </div>
                </div>

                {/* Gestion Distribution */}
                <div className="bg-white border border-nods-border rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between text-nods-text-primary">
                        Estados de Gestión
                        <CheckCircle2 className="w-5 h-5 text-nods-success" />
                    </h3>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.estados_gestion.slice(0, 8)} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="gestion" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} width={120} />
                                <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="#2563EB" barSize={15} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Programs Detailed States */}
            <div className="bg-white border border-nods-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-nods-border flex items-center justify-between bg-slate-50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-nods-text-primary">Desglose por Programa</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-nods-text-muted">
                        <span className="w-2 h-2 rounded-full bg-nods-accent" /> En Gestión
                        <span className="w-2 h-2 rounded-full bg-red-600 ml-2" /> No Útil
                        <span className="w-2 h-2 rounded-full bg-nods-success ml-2" /> Pagados
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-nods-border text-[10px] font-bold text-nods-text-muted uppercase tracking-widest">
                                <th className="px-6 py-4">Programa</th>
                                <th className="px-6 py-4 text-center">Leads</th>
                                <th className="px-6 py-4 text-center">Gestión</th>
                                <th className="px-6 py-4 text-center">No Útil</th>
                                <th className="px-6 py-4 text-center">Op. Venta</th>
                                <th className="px-6 py-4 text-center">Págados</th>
                                <th className="px-6 py-4 text-center">Avance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nods-border">
                            {data.estados_by_programa.map((item, idx) => {
                                const meta = 50;
                                return (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-nods-text-primary">{item.programa}</td>
                                        <td className="px-6 py-4 text-center font-bold text-nods-text-primary">{item.leads}</td>
                                        <td className="px-6 py-4 text-center font-bold text-nods-accent">{item.en_gestion}</td>
                                        <td className="px-6 py-4 text-center font-bold text-red-600">{item.no_util}</td>
                                        <td className="px-6 py-4 text-center font-bold text-nods-text-primary">{item.op_venta}</td>
                                        <td className="px-6 py-4 text-center font-black text-nods-success">{item.proceso_pago}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className="h-full bg-nods-accent"
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

        </div>
    );
}

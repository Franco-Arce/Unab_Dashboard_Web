import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Send,
    CheckCircle2,
    XCircle,
    Users,
    LogOut,
    ChevronRight,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import AIPanel from '../components/AIPanel';
import api from '../api';
import logoUnab from '../assets/logo-unab.png';
import nodsWhite from '../assets/nods-white.png';
import nodsDark from '../assets/nods-dark.png';

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [meta, setMeta] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.me().then(setUser).catch(() => navigate('/'));
        loadMeta();
    }, []);

    const loadMeta = () => {
        api.meta().then(setMeta).catch(() => { });
    };

    const handleLogout = () => {
        localStorage.removeItem('unab_token');
        navigate('/');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.refresh();
            await loadMeta();
            // Trigger a re-render of the current page if it's a dashboard child
            // This is a simple way; a better way would be a global state/event,
            // but for now, re-fetching meta might be enough if pages listen or we just notify.
            window.location.reload(); // Simple brute force to ensure all charts update
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
        { path: '/dashboard/admisiones', label: 'Admisiones', icon: Send },
        { path: '/dashboard/estados', label: 'Estados', icon: CheckCircle2 },
        { path: '/dashboard/no-util', label: 'No Útil', icon: XCircle },
        { path: '/dashboard/leads', label: 'Leads', icon: Users },
    ];

    const currentTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="flex min-h-screen bg-nods-bg text-nods-text-primary font-sans">
            {/* Sidebar ... (no changes needed) */}
            <aside className="w-64 border-r border-nods-border bg-nods-sidebar flex flex-col sticky top-0 h-screen transition-all duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-10 px-2">
                        <img src={nodsWhite} alt="NODS" className="h-6 w-auto opacity-90" />
                        <div className="h-6 w-[1px] bg-slate-700/50" />
                        <img src={logoUnab} alt="UNAB" className="h-7 w-auto" />
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) => `
                                    flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                                    ${isActive
                                        ? 'bg-nods-accent text-white font-bold shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-nods-accent'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {location.pathname === item.path && <ChevronRight className="w-4 h-4" />}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-800/50">
                    <div className="bg-slate-900/50 p-4 rounded-2xl mb-4 border border-slate-800">
                        <div className="flex items-center gap-3 mb-2 text-white">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                {user?.username?.[0] || 'A'}
                            </div>
                            <span className="text-sm font-medium">{user?.username || 'Admin'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors w-full"
                        >
                            <LogOut className="w-3 h-3" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Header */}
                <header className="h-20 border-b border-nods-border/50 bg-nods-card/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold">{currentTitle}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 bg-white text-nods-text-primary border border-nods-border hover:border-nods-accent hover:text-nods-accent px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                ACTUALIZAR DATOS
                            </button>
                            {meta?.fecha_actualizacion && (
                                <span className="text-nods-text-muted text-[10px] uppercase font-bold tracking-wider flex items-center h-full pt-1">
                                    Actualizado: {meta.fecha_actualizacion}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 mr-4">
                            <img src={nodsDark} alt="NODS" className="h-4 w-auto opacity-40 grayscale hover:grayscale-0 transition-all cursor-help" title="Powered by NODS" />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Aliado Educativo</span>
                            <span className="font-bold text-sm text-nods-text-primary">Universidad UNAB</span>
                        </div>
                        <div className="w-11 h-11 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center border border-nods-border/50 mr-2">
                            <img src={logoUnab} alt="UNAB" className="w-full h-auto object-contain" />
                        </div>
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className={`p-2.5 rounded-xl border transition-all ${showAI
                                ? 'bg-nods-accent border-nods-accent text-white shadow-lg shadow-nods-accent/20 scale-110'
                                : 'bg-white border-nods-border text-nods-text-muted hover:border-nods-accent/50 hover:text-nods-accent hover:bg-slate-50'
                                }`}
                            title="Asistente IA"
                        >
                            <Sparkles size={18} className={showAI ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>

                <AnimatePresence>
                    {showAI && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAI(false)}
                                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                            />
                            <AIPanel onClose={() => setShowAI(false)} />
                        </>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

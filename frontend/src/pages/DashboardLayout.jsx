import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Send,
    CheckCircle2,
    XCircle,
    Users,
    LogOut,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import api from '../api';

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [meta, setMeta] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
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
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-10 h-10 bg-nods-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                            <span className="text-white font-black text-xl">U</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white leading-tight">UNAB</h1>
                            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Dashboard</p>
                        </div>
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
            <main className="flex-1 ml-64 min-h-screen">
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
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aliado Educativo</span>
                            <span className="font-bold text-sm">Universidad UNAB</span>
                        </div>
                        <div className="w-10 h-10 bg-white p-1.5 rounded-xl shadow-md flex items-center justify-center border border-nods-border">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/LogoUnab.png" alt="UNAB" className="w-full h-auto object-contain" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

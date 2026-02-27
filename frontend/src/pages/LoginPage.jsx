import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';
import logoUnab from '../assets/unab-logo.jpg';
import nodsDark from '../assets/nods-dark.png';

// Animated floating particles for the branding panel
const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                    width: Math.random() * 4 + 1,
                    height: Math.random() * 4 + 1,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: `rgba(99, 179, 237, ${Math.random() * 0.3 + 0.05})`,
                }}
                animate={{
                    y: [0, -30 - Math.random() * 40, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.1, 0.5, 0.1],
                }}
                transition={{
                    duration: 4 + Math.random() * 6,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: 'easeInOut',
                }}
            />
        ))}
    </div>
);

// Subtle grid background
const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%">
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    </div>
);

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.login(username, password);
            localStorage.setItem('unab_token', res.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            if (err.message === 'Failed to fetch') {
                setError('No se pudo conectar con el servidor.');
            } else {
                setError(err.message || 'Credenciales incorrectas');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel – Branding */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-[#0a0f18] via-[#0f1b2e] to-[#1e3a8a] flex-col justify-between p-12 overflow-hidden">
                <GridBackground />
                <FloatingParticles />

                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                {/* Top: Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-8">
                        <img src={logoUnab} alt="UNAB" className="w-14 h-auto" />
                    </div>
                </motion.div>

                {/* Center: Main text */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 flex-1 flex flex-col justify-center"
                >
                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                        Dashboard de<br />
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            Control de Campaña
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                        Monitoreo en tiempo real de leads, admisiones y rendimiento de programas académicos.
                    </p>

                    {/* Stats preview */}
                    <div className="flex gap-6 mt-10">
                        {[
                            { label: 'KPIs', value: '6+' },
                            { label: 'Análisis IA', value: '✦' },
                            { label: 'Tiempo Real', value: '24/7' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.15 }}
                                className="text-center"
                            >
                                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom: Nods branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="relative z-10 flex items-center gap-3"
                >
                    <div className="w-8 h-px bg-slate-700" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Powered by</span>
                    <img src={nodsDark} alt="NODS" className="h-4 w-auto opacity-40 invert" />
                </motion.div>
            </div>

            {/* Right Panel – Login Form */}
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 lg:p-12 relative">
                {/* Mobile header (visible only on small screens) */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <img src={logoUnab} alt="UNAB" className="w-7 h-auto" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">UNAB</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-sm"
                >
                    {/* Welcome text */}
                    <div className="mb-10">
                        <motion.h2
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-black text-slate-900 tracking-tight"
                        >
                            Bienvenido
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-400 text-sm font-medium mt-2"
                        >
                            Ingresá tus credenciales para acceder al panel
                        </motion.p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username field */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
                                Usuario
                            </label>
                            <div className={`relative group transition-all duration-300 ${focusedField === 'user' ? 'scale-[1.02]' : ''}`}>
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${focusedField === 'user' ? 'bg-blue-50' : 'bg-slate-100'
                                    }`}>
                                    <User className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'user' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('user')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Ingresá tu usuario"
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none transition-all duration-300 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] hover:border-slate-200"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password field */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
                                Contraseña
                            </label>
                            <div className={`relative group transition-all duration-300 ${focusedField === 'pass' ? 'scale-[1.02]' : ''}`}>
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${focusedField === 'pass' ? 'bg-blue-50' : 'bg-slate-100'
                                    }`}>
                                    <Lock className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'pass' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('pass')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none transition-all duration-300 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] hover:border-slate-200"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 text-red-600 text-xs font-bold bg-red-50 p-3.5 rounded-xl border border-red-100"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    Ingresando...
                                </>
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-3"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Desarrollado por</span>
                        <img src={nodsDark} alt="NODS" className="h-5 w-auto opacity-30 hover:opacity-60 transition-opacity duration-500" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

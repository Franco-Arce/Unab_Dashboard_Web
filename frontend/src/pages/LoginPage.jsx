import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';
import logoUnab from '../assets/unab-logo.jpg';
import nodsWhite from '../assets/nods-white.png';

export default function LoginPage() {
    const [username, setUsername] = useState('Admin'); // Default for convenience
    const [password, setPassword] = useState('Admin123'); // Default for convenience
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
                setError('No se pudo conectar con el servidor. Verifica VITE_API_URL en Vercel.');
            } else {
                setError(err.message || 'Credenciales incorrectas');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-nods-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-nods-card backdrop-blur-xl border border-nods-border p-8 rounded-3xl"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-transparent rounded-3xl flex items-center justify-center mb-6">
                        <img
                            src={logoUnab}
                            alt="UNAB"
                            className="w-16 h-auto mix-blend-multiply"
                        />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-nods-text-primary">Universidad UNAB</h1>
                    <p className="text-nods-text-muted text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Dashboard de Control de Campaña</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-nods-text-muted mb-2">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nods-text-muted" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-nods-bg border border-nods-border rounded-xl py-3 pl-10 pr-4 focus:border-nods-accent focus:ring-1 focus:ring-nods-accent transition-all outline-none text-nods-text-primary font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-nods-text-muted mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nods-text-muted" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-nods-bg border border-nods-border rounded-xl py-3 pl-10 pr-4 focus:border-nods-accent focus:ring-1 focus:ring-nods-accent transition-all outline-none text-nods-text-primary font-medium"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-nods-accent hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.2)] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-nods-border/50 flex flex-col items-center">
                    <img
                        src={nodsWhite}
                        alt="NODS"
                        className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity duration-500"
                    />
                </div>
            </motion.div>
        </div>
    );
}

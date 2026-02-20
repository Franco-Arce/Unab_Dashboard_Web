const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
    return localStorage.getItem('unab_token');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...options.headers,
        },
    });
    if (res.status === 401) {
        localStorage.removeItem('unab_token');
        window.location.href = '/';
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error de servidor');
    }
    return res.json();
}

export const api = {
    // Auth
    login: (username, password) =>
        request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
    me: () => request('/api/auth/me'),

    // Dashboard
    kpis: () => request('/api/dashboard/kpis'),
    funnel: () => request('/api/dashboard/funnel'),
    admisiones: () => request('/api/dashboard/admisiones'),
    estados: () => request('/api/dashboard/estados'),
    noUtil: () => request('/api/dashboard/no-util'),
    admitidos: () => request('/api/dashboard/admitidos'),
    leads: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
        return request(`/api/dashboard/leads?${q.toString()}`);
    },
    meta: () => request('/api/dashboard/meta'),
    refresh: () => request('/api/dashboard/refresh', { method: 'POST' }),

    // AI
    aiChat: (message, history = []) =>
        request('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history }),
        }),
    aiInsights: () => request('/api/ai/insights'),
    aiPredictions: () => request('/api/ai/predictions'),
};

export default api;

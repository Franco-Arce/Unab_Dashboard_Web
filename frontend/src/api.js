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

let dashboardContext = {};

export const api = {
    // Auth
    login: (username, password) =>
        request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
    me: () => request('/api/auth/me'),

    // Dashboard
    kpis: async (nivel) => {
        const q = new URLSearchParams();
        if (nivel) q.set('nivel', nivel);
        q.set('t', Date.now());
        const res = await request(`/api/dashboard/kpis?${q.toString()}`);

        // Hotfix: If backend hasn't been re-deployed to include global op_venta sum
        if (res && (!res.op_venta || res.op_venta === 0)) {
            try {
                const estRes = await request(`/api/dashboard/estados?${q.toString()}`);
                if (estRes && estRes.estados_by_programa) {
                    res.op_venta = estRes.estados_by_programa.reduce((acc, p) => acc + (p.op_venta || 0), 0);
                }
            } catch (e) {
                console.error("Error patching op_venta", e);
            }
        }

        dashboardContext.kpis = res;
        return res;
    },
    funnel: async (nivel) => {
        const q = new URLSearchParams();
        if (nivel) q.set('nivel', nivel);
        q.set('t', Date.now());
        const res = await request(`/api/dashboard/funnel?${q.toString()}`);

        // Hotfix for funnel op_venta
        const opVentaItem = res.find(f => f.stage === "Oportunidad de Venta");
        if (opVentaItem && (!opVentaItem.value || opVentaItem.value === 0)) {
            try {
                const estRes = await request(`/api/dashboard/estados?${q.toString()}`);
                if (estRes && estRes.estados_by_programa) {
                    const totalLeads = res.find(f => f.stage === "Total Leads")?.value || 1;
                    const realOpVenta = estRes.estados_by_programa.reduce((acc, p) => acc + (p.op_venta || 0), 0);
                    opVentaItem.value = realOpVenta;
                    opVentaItem.percent = Math.round((realOpVenta / totalLeads) * 100 * 100) / 100;
                }
            } catch (e) {
                console.error("Error patching funnel op_venta", e);
            }
        }

        dashboardContext.funnel = res;
        return res;
    },
    admisiones: async (nivel) => {
        const q = new URLSearchParams();
        if (nivel) q.set('nivel', nivel);
        q.set('t', Date.now());
        const res = await request(`/api/dashboard/admisiones?${q.toString()}`);
        dashboardContext.admisiones = res;
        return res;
    },
    estados: async (nivel) => {
        const q = new URLSearchParams();
        if (nivel) q.set('nivel', nivel);
        q.set('t', Date.now());
        const res = await request(`/api/dashboard/estados?${q.toString()}`);
        dashboardContext.estados = res;
        return res;
    },
    noUtil: async (nivel) => {
        const q = new URLSearchParams();
        if (nivel) q.set('nivel', nivel);
        q.set('t', Date.now());
        const res = await request(`/api/dashboard/no-util?${q.toString()}`);
        dashboardContext.noUtil = res;
        return res;
    },
    noUtilCsv: async () => {
        // Fetch the CSV as blob and trigger browser download
        const token = localStorage.getItem('unab_token');
        const res = await fetch(`${API_URL}/api/dashboard/no-util-csv`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error descargando CSV');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agg_no_utiles_completo.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    admitidos: async () => {
        const res = await request('/api/dashboard/admitidos');
        dashboardContext.admitidos = res;
        return res;
    },
    leads: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
        return request(`/api/dashboard/leads?${q.toString()}`);
    },
    bases: () => request('/api/dashboard/bases'),
    estadosGestion: () => request('/api/dashboard/estados-gestion'),
    meta: () => request('/api/dashboard/meta'),
    refresh: () => request('/api/dashboard/refresh', { method: 'POST' }),

    // AI
    aiChat: (message, history = []) =>
        request('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history, context_data: dashboardContext }),
        }),
    aiInsights: () => request('/api/ai/insights', {
        method: 'POST',
        body: JSON.stringify({ context_data: dashboardContext }),
    }),
    aiPredictions: () => request('/api/ai/predictions', {
        method: 'POST',
        body: JSON.stringify({ context_data: dashboardContext }),
    }),
    exportLeads: async (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });

        const res = await fetch(`${API_URL}/api/dashboard/export?${q.toString()}`, {
            headers: authHeaders(),
        });

        if (!res.ok) throw new Error('Error al exportar Excel');

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Leads_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};

export default api;

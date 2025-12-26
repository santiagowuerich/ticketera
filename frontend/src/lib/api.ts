import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for errors (including 401 redirect)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        // Si es 401 Unauthorized, limpiar token y redirigir a login
        if (error.response?.status === 401 && window.location.pathname.startsWith('/dashboard')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Types
export interface Event {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    available_spots: number;
    is_active: boolean;
}

export interface CreateTicketDto {
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerDni: string;
    customerPhone?: string;
    quantity: number;
    selectedDate?: string;
    selectedTime?: string;
}

export interface Ticket {
    id: string;
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerDni: string;
    quantity: number;
    totalPrice: number;
    currency: string;
    status: string;
    qrCode: string;
    createdAt: string;
    usedDate?: string;
    selectedDate?: string;
    selectedTime?: string;
    event?: {
        title: string;
    };
}

export interface DashboardStats {
    ticketsSoldToday: number;
    totalTicketsSold: number;
    visitorsToday: number;
    totalRevenue: number;
    upcomingReservations: number;
}

// Events API
export const eventsApi = {
    getAll: () => api.get<Event[]>('/events'),
    getAvailable: () => api.get<Event[]>('/events/available'),
    getOne: (id: string) => api.get<Event>(`/events/${id}`),
};

// Tickets API
export const ticketsApi = {
    create: (data: CreateTicketDto) => api.post<Ticket>('/tickets', data),
    getAll: () => api.get<Ticket[]>('/tickets'),
    getStats: () => api.get<DashboardStats>('/tickets/stats'),
    getRecentValidations: (limit?: number) => api.get<Ticket[]>(`/tickets/recent-validations${limit ? `?limit=${limit}` : ''}`),
    searchByEmail: (email: string) => api.get<Ticket[]>(`/tickets/search?email=${email}`),
    searchByDni: (dni: string) => api.get<Ticket[]>(`/tickets/search-dni?dni=${dni}`),
    getOne: (id: string) => api.get<Ticket>(`/tickets/${id}`),
    validateQr: (qrCode: string) => api.post<{ success: boolean; message: string; ticket?: any }>('/tickets/validate-qr', { qrCode }),
};

// Payments API
export const paymentsApi = {
    createPreference: (data: {
        ticketId: string;
        successUrl: string;
        failureUrl: string;
        pendingUrl: string;
    }) => api.post('/payments/create-preference', data),
    getStatus: (ticketId: string) => api.get(`/payments/status/${ticketId}`),
};

export default api;

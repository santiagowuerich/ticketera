import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Ticket,
    Plus,
    Calendar,
    Clock,
    Users,
    X,
    Loader2,
    ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ticketsApi, Ticket as TicketType } from '@/lib/api';

interface TimeSlot {
    date: string;
    time: string;
    dayName: string;
    isToday: boolean;
    online: number;
    manual: number;
    total: number;
    capacity: number;
}

const TIME_SLOTS = [
    { label: '10:00 - 14:00', hours: ['10:00', '11:30', '14:00'] },
    { label: '16:00 - 20:00', hours: ['16:00', '18:00'] },
];
const CAPACITY_PER_SLOT = 100;

export default function DashboardEventos() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerDni: '',
        customerEmail: '',
        quantity: 1,
        selectedDate: '',
        selectedTime: '',
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await ticketsApi.getAll();
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate time slots for the next 7 days
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter valid tickets (PAID or USED) - status can be lowercase from API
        const validTickets = tickets.filter(t => {
            const status = t.status?.toLowerCase();
            return status === 'paid' || status === 'used';
        });

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' });
            const isToday = i === 0;

            for (const timeSlot of TIME_SLOTS) {
                // Count tickets for this slot - match any of the hours in the slot
                const slotTickets = validTickets.filter(
                    (t) => t.selectedDate === dateStr && timeSlot.hours.includes(t.selectedTime || '')
                );

                // Count total tickets for this slot
                const totalCount = slotTickets.reduce((acc, t) => acc + (t.quantity || 1), 0);

                slots.push({
                    date: dateStr,
                    time: timeSlot.label,
                    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    isToday,
                    online: totalCount,
                    manual: 0,
                    total: totalCount,
                    capacity: CAPACITY_PER_SLOT,
                });
            }
        }

        return slots;
    };

    const timeSlots = generateTimeSlots();
    const totalSold = tickets.reduce((acc, t) => acc + (t.quantity || 1), 0);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase(),
        };
    };

    const openAddTicketModal = (slot?: TimeSlot) => {
        setSelectedSlot(slot || null);
        setFormData({
            customerName: '',
            customerDni: '',
            customerEmail: '',
            quantity: 1,
            selectedDate: slot?.date || timeSlots[0]?.date || '',
            selectedTime: slot?.time || timeSlots[0]?.time || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.customerName || !formData.customerDni) return;

        setIsSubmitting(true);
        try {
            await ticketsApi.create({
                eventId: 'default-event',
                customerName: formData.customerName,
                customerEmail: formData.customerEmail || `manual-${Date.now()}@museo.local`,
                customerDni: formData.customerDni,
                quantity: formData.quantity,
                selectedDate: formData.selectedDate,
                selectedTime: formData.selectedTime,
            });

            await fetchTickets();
            setShowModal(false);
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-rust" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-foreground">
            {/* Header */}
            <header className="bg-[#1f1f1f] border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rust/20">
                                <Ticket className="w-6 h-6 text-rust-light" />
                            </div>
                            <div>
                                <h1 className="text-xl font-serif font-semibold">Visita Guiada - Museo La Unidad</h1>
                                <p className="text-sm text-muted-foreground">Gestión de fechas y entradas</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#2d2d2d] rounded-lg px-4 py-2 text-center">
                            <p className="text-xs text-muted-foreground">Total Vendidas</p>
                            <p className="text-2xl font-bold text-foreground">{totalSold}</p>
                        </div>
                        <Button
                            onClick={() => openAddTicketModal()}
                            className="bg-rust hover:bg-rust-light text-foreground"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Ticket Manual
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Próximas Fechas
                </h2>

                <div className="space-y-3">
                    {timeSlots.map((slot, index) => {
                        const { day, month } = formatDate(slot.date);
                        const percentage = Math.round((slot.total / slot.capacity) * 100);
                        const barColor = percentage > 70 ? 'bg-orange-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-green-500';

                        return (
                            <div
                                key={`${slot.date}-${slot.time}`}
                                className="bg-[#2d2d2d] rounded-xl p-4 border border-border hover:border-rust/50 transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Date */}
                                    <div className="w-16 text-center">
                                        <p className="text-3xl font-bold text-foreground">{day}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{month}</p>
                                    </div>

                                    {/* Day and Time */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-foreground font-medium">{slot.dayName}</span>
                                            {slot.isToday && (
                                                <Badge className="bg-rust/20 text-rust-light border-rust/30 text-xs">
                                                    Hoy
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{slot.time}</p>
                                    </div>

                                    {/* Online Count */}
                                    <div className="text-center w-20">
                                        <p className="text-xs text-muted-foreground">Online</p>
                                        <p className="text-2xl font-bold text-foreground">{slot.online}</p>
                                    </div>

                                    {/* Manual Count */}
                                    <div className="text-center w-20">
                                        <p className="text-xs text-muted-foreground">Manual</p>
                                        <p className="text-2xl font-bold text-rust-light">{slot.manual}</p>
                                    </div>

                                    {/* Capacity Bar */}
                                    <div className="w-32">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">{slot.total}/{slot.capacity}</span>
                                            <span className="text-foreground font-medium">{percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor} transition-all`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Add Button */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-border hover:border-rust hover:bg-rust/10"
                                        onClick={() => openAddTicketModal(slot)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#2d2d2d] rounded-2xl p-6 w-full max-w-md border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Ticket className="w-5 h-5 text-rust-light" />
                                <h3 className="text-lg font-serif font-semibold">Agregar Ticket Manual</h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Nombre Completo</label>
                                <Input
                                    placeholder="Ingrese nombre..."
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="bg-[#1a1a1a] border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">DNI</label>
                                <Input
                                    placeholder="Ingrese DNI..."
                                    value={formData.customerDni}
                                    onChange={(e) => setFormData({ ...formData, customerDni: e.target.value })}
                                    className="bg-[#1a1a1a] border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Email (opcional)</label>
                                <Input
                                    placeholder="Ingrese email..."
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    className="bg-[#1a1a1a] border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Cantidad</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="bg-[#1a1a1a] border-border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Fecha y Turno</label>
                                <select
                                    value={`${formData.selectedDate}|${formData.selectedTime}`}
                                    onChange={(e) => {
                                        const [date, time] = e.target.value.split('|');
                                        setFormData({ ...formData, selectedDate: date, selectedTime: time });
                                    }}
                                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-border rounded-lg text-foreground"
                                >
                                    {timeSlots.map((slot) => {
                                        const { day, month } = formatDate(slot.date);
                                        return (
                                            <option key={`${slot.date}-${slot.time}`} value={`${slot.date}|${slot.time}`}>
                                                {slot.dayName.slice(0, 3)}, {day} {month.toLowerCase()} - {slot.time} ({slot.total}/{slot.capacity})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-rust hover:bg-rust-light"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.customerName || !formData.customerDni}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agregar Ticket'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

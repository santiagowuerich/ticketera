import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, Ticket, Calendar, Clock, User, Mail, QrCode } from 'lucide-react';
import { ticketsApi, Ticket as TicketType } from '@/lib/api';

export default function Confirmacion() {
    const [searchParams] = useSearchParams();
    const ticketId = searchParams.get('ticket');
    const [ticket, setTicket] = useState<TicketType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ticketId) {
            setError('No se encontró el ticket.');
            setLoading(false);
            return;
        }

        const fetchTicket = async () => {
            try {
                const response = await ticketsApi.getOne(ticketId);
                setTicket(response.data);
            } catch (err) {
                console.error('Error fetching ticket:', err);
                setError('No se pudo cargar la información del ticket.');
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rust" />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
                    <div className="container mx-auto px-4 py-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Volver al inicio</span>
                        </Link>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="font-serif text-3xl font-bold mb-4 text-red-400">Error</h1>
                    <p className="text-muted-foreground">{error || 'Ticket no encontrado.'}</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver al inicio</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                        ¡Compra Confirmada!
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Tu entrada ha sido reservada exitosamente. Recibiras un email con los detalles.
                    </p>

                    {/* Ticket Card */}
                    <div className="glass-card rounded-xl p-6 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Ticket className="w-6 h-6 text-rust" />
                            <span className="font-semibold text-lg">Detalles del Ticket</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nombre</p>
                                    <p className="font-medium">{ticket.customerName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{ticket.customerEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha de visita</p>
                                    <p className="font-medium">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-AR') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Ticket className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Cantidad</p>
                                    <p className="font-medium">{ticket.quantity} entrada(s)</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code placeholder */}
                        {ticket.qrCode && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                                        <QrCode className="w-5 h-5" />
                                        <span>Código QR</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <img src={ticket.qrCode} alt="QR Code" className="w-48 h-48" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Presentá este código en la entrada del museo</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rust hover:bg-rust-light text-foreground font-semibold rounded-lg transition-all"
                        >
                            Volver al inicio
                        </Link>
                    </div>

                    <p className="text-muted-foreground text-sm mt-8">
                        ID del ticket: <code className="bg-muted px-2 py-1 rounded">{ticket.id}</code>
                    </p>
                </div>
            </main>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  QrCode,
  Search,
  History,
  Clock,
  Users,
  CalendarCheck,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ticketsApi, DashboardStats, Ticket } from '@/lib/api';

type ValidationResult = 'idle' | 'success' | 'error';

interface ValidationInfo {
  result: ValidationResult;
  message: string;
  customerName?: string;
  eventTitle?: string;
}

const sidebarItems = [
  { icon: Home, label: 'Inicio / KPIs', href: '/dashboard', active: true },
  { icon: QrCode, label: 'Validar Entrada', href: '/dashboard', active: false },
  { icon: Calendar, label: 'Gestión de Fechas', href: '/dashboard/eventos', active: false },
  { icon: Search, label: 'Buscar Reserva', href: '/dashboard', active: false },
  { icon: History, label: 'Historial', href: '/dashboard', active: false },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ticketCode, setTicketCode] = useState('');
  const [dniSearch, setDniSearch] = useState('');
  const [validationInfo, setValidationInfo] = useState<ValidationInfo>({ result: 'idle', message: '' });
  const [recentEntries, setRecentEntries] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Ticket[] | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch stats and recent validations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          ticketsApi.getStats(),
          ticketsApi.getRecentValidations(10),
        ]);
        setStats(statsRes.data);
        setRecentEntries(recentRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Autofocus en el input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleValidation = async () => {
    if (!ticketCode.trim() || isValidating) return;

    setIsValidating(true);
    try {
      const response = await ticketsApi.validateQr(ticketCode);
      const { success, message, ticket } = response.data;

      if (success) {
        setValidationInfo({
          result: 'success',
          message: 'ACCESO PERMITIDO',
          customerName: ticket?.customerName,
          eventTitle: ticket?.eventTitle,
        });
        // Refresh recent entries
        const recentRes = await ticketsApi.getRecentValidations(10);
        setRecentEntries(recentRes.data);
        // Update stats
        const statsRes = await ticketsApi.getStats();
        setStats(statsRes.data);
      } else {
        setValidationInfo({
          result: 'error',
          message: message || 'Ticket no válido o ya utilizado',
        });
      }
    } catch (error) {
      setValidationInfo({
        result: 'error',
        message: 'Error al validar ticket',
      });
    } finally {
      setIsValidating(false);
      setTimeout(() => {
        setValidationInfo({ result: 'idle', message: '' });
        setTicketCode('');
        inputRef.current?.focus();
      }, 3000);
    }
  };

  const handleDniSearch = async () => {
    if (!dniSearch.trim()) return;
    try {
      const response = await ticketsApi.searchByDni(dniSearch);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching by DNI:', error);
      setSearchResults([]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const maxCapacity = 300; // Configurable
  const occupancyPercentage = stats ? (stats.visitorsToday / maxCapacity) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-rust" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-[#121212] border-r border-border flex flex-col py-6">
        <div className="px-4 mb-8 hidden lg:block">
          <h2 className="font-serif text-lg text-foreground">Control de Acceso</h2>
          <p className="text-xs text-muted-foreground">Museo La Unidad</p>
        </div>

        <nav className="flex-1 space-y-2 px-3">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${item.active
                  ? 'bg-rust/20 text-rust-light'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#1f1f1f] border-b border-border px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm capitalize">{formatDate(currentTime)}</p>
              <p className="text-2xl font-mono text-foreground tracking-wider">{formatTime(currentTime)}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Buscador por DNI */}
              <div className="relative flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por DNI..."
                    value={dniSearch}
                    onChange={(e) => setDniSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDniSearch()}
                    className="pl-10 w-48 lg:w-64 bg-[#2d2d2d] border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button onClick={handleDniSearch} variant="outline" size="sm">
                  Buscar
                </Button>
              </div>

              <div className="flex items-center gap-2 bg-[#2d2d2d] px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-rust-light" />
                <span className="text-sm text-foreground hidden sm:block">Operador: Puerta Principal</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Search Results Modal */}
          {searchResults !== null && (
            <section className="bg-[#2d2d2d] rounded-xl p-6 border border-rust/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-serif text-foreground flex items-center gap-3">
                  <Search className="w-5 h-5 text-rust-light" />
                  Resultados de Búsqueda ({searchResults.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { setSearchResults(null); setDniSearch(''); }}>
                  Cerrar
                </Button>
              </div>
              {searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground">DNI</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((ticket) => (
                      <TableRow key={ticket.id} className="border-border hover:bg-[#1a1a1a]">
                        <TableCell className="text-foreground">{ticket.customerName}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{ticket.customerDni}</TableCell>
                        <TableCell>
                          <Badge
                            className={ticket.status === 'USED'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-[hsl(var(--status-success))]/20 text-[hsl(var(--status-success))]'
                            }
                          >
                            {ticket.status === 'USED' ? 'Usado' : ticket.status === 'PAID' ? 'Válido' : ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString('es-AR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No se encontraron tickets para este DNI.</p>
              )}
            </section>
          )}

          {/* KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Visitantes Ingresados Hoy */}
            <div className="bg-[#2d2d2d] rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[hsl(var(--status-success))]/20">
                  <Users className="w-5 h-5 text-[hsl(var(--status-success))]" />
                </div>
                <span className="text-muted-foreground text-sm">Visitantes Hoy</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-foreground">{stats?.visitorsToday || 0}</span>
                <span className="text-muted-foreground text-lg mb-1">/ {maxCapacity}</span>
              </div>
              <Progress value={occupancyPercentage} className="mt-4 h-2 bg-[#1a1a1a]" />
            </div>

            {/* Tickets Vendidos Hoy */}
            <div className="bg-[#2d2d2d] rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-rust/20">
                  <CalendarCheck className="w-5 h-5 text-rust-light" />
                </div>
                <span className="text-muted-foreground text-sm">Vendidos Hoy</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-foreground">{stats?.ticketsSoldToday || 0}</span>
                <span className="text-muted-foreground text-lg mb-1">tickets</span>
              </div>
            </div>

            {/* Reservas Pendientes */}
            <div className="bg-[#2d2d2d] rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${(stats?.upcomingReservations || 0) > 0 ? 'bg-[hsl(var(--status-warning))]/20' : 'bg-muted/20'}`}>
                  <AlertTriangle className={`w-5 h-5 ${(stats?.upcomingReservations || 0) > 0 ? 'text-[hsl(var(--status-warning))]' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-muted-foreground text-sm">Reservas Pendientes</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-foreground">{stats?.upcomingReservations || 0}</span>
                <span className="text-muted-foreground text-lg mb-1">por validar</span>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div className="bg-[#2d2d2d] rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[hsl(var(--status-success))]/20">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--status-success))]" />
                </div>
                <span className="text-muted-foreground text-sm">Ingresos Totales</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue || 0)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="text-rust-light font-semibold">{stats?.totalTicketsSold || 0}</span> tickets vendidos
              </p>
            </div>
          </section>

          {/* Validación Rápida */}
          <section className="bg-[#2d2d2d] rounded-xl p-8 border border-border">
            <h3 className="text-xl font-serif text-foreground mb-6 flex items-center gap-3">
              <QrCode className="w-6 h-6 text-rust-light" />
              Validación Rápida
            </h3>

            <div className="max-w-xl mx-auto space-y-6">
              <div className="relative">
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ingresar código de ticket (ID)..."
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidation()}
                  className="pl-14 h-16 text-lg bg-[#1a1a1a] border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-rust-light transition-colors"
                />
              </div>

              <Button
                onClick={handleValidation}
                disabled={!ticketCode.trim() || isValidating}
                className="w-full h-14 text-lg font-semibold bg-rust hover:bg-rust-light text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isValidating ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Validar Acceso
              </Button>

              {/* Resultado de Validación */}
              {validationInfo.result !== 'idle' && (
                <div
                  className={`p-6 rounded-xl border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4
                    ${validationInfo.result === 'success'
                      ? 'bg-[hsl(var(--status-success))]/10 border-[hsl(var(--status-success))]'
                      : 'bg-[hsl(var(--status-danger))]/10 border-[hsl(var(--status-danger))]'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {validationInfo.result === 'success' ? (
                      <CheckCircle2 className="w-12 h-12 text-[hsl(var(--status-success))]" />
                    ) : (
                      <XCircle className="w-12 h-12 text-[hsl(var(--status-danger))]" />
                    )}
                    <div>
                      <h4 className={`text-2xl font-bold ${validationInfo.result === 'success' ? 'text-[hsl(var(--status-success))]' : 'text-[hsl(var(--status-danger))]'}`}>
                        {validationInfo.result === 'success' ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                      </h4>
                      <p className="text-foreground text-lg">
                        {validationInfo.result === 'success'
                          ? `${validationInfo.customerName} (${validationInfo.eventTitle || 'Entrada General'})`
                          : validationInfo.message
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Ingresos Recientes */}
          <section className="bg-[#2d2d2d] rounded-xl p-6 border border-border">
            <h3 className="text-lg font-serif text-foreground mb-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-rust-light" />
              Ingresos Recientes
            </h3>

            <div className="overflow-x-auto">
              {recentEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Hora</TableHead>
                      <TableHead className="text-muted-foreground">ID Ticket</TableHead>
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground">Cantidad</TableHead>
                      <TableHead className="text-muted-foreground text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEntries.map((entry) => (
                      <TableRow key={entry.id} className="border-border hover:bg-[#1a1a1a]">
                        <TableCell className="font-mono text-foreground">
                          {entry.usedDate ? new Date(entry.usedDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">{entry.id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-foreground">{entry.customerName}</TableCell>
                        <TableCell className="text-foreground font-semibold">{entry.quantity} entrada(s)</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className="bg-[hsl(var(--status-success))]/20 text-[hsl(var(--status-success))] border-[hsl(var(--status-success))]/30"
                          >
                            Validado
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay ingresos recientes registrados.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

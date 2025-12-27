import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
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
export interface DashboardStats {
    ticketsSoldToday: number;
    totalTicketsSold: number;
    visitorsToday: number;
    totalRevenue: number;
    upcomingReservations: number;
}
export declare class TicketsService {
    private ticketsRepository;
    private eventsRepository;
    constructor(ticketsRepository: Repository<Ticket>, eventsRepository: Repository<Event>);
    create(createTicketDto: CreateTicketDto): Promise<Ticket>;
    findAll(): Promise<Ticket[]>;
    findOne(id: string): Promise<Ticket>;
    getStats(): Promise<DashboardStats>;
    getRecentValidations(limit?: number): Promise<Ticket[]>;
    searchByEmail(email: string): Promise<Ticket[]>;
    searchByDni(dni: string): Promise<Ticket[]>;
    validateQr(qrCode: string): Promise<{
        success: boolean;
        message: string;
        ticket?: Ticket;
    }>;
}

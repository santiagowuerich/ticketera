import { TicketsService, CreateTicketDto } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto): Promise<import("../entities").Ticket>;
    findAll(): Promise<import("../entities").Ticket[]>;
    getStats(): Promise<import("./tickets.service").DashboardStats>;
    getRecentValidations(limit?: string): Promise<import("../entities").Ticket[]>;
    searchByEmail(email: string): Promise<import("../entities").Ticket[]>;
    searchByDni(dni: string): Promise<import("../entities").Ticket[]>;
    validateQr(qrCode: string): Promise<{
        success: boolean;
        message: string;
        ticket?: import("../entities").Ticket;
    }>;
    findOne(id: string): Promise<import("../entities").Ticket>;
}

import { ConfigService } from '@nestjs/config';
import { Ticket } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendTicketConfirmation(ticket: Ticket, event: Event): Promise<void>;
    private generateTicketEmail;
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
    ) { }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const event = await this.eventsRepository.findOne({
            where: { id: createTicketDto.eventId },
        });

        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }

        if (event.availableSpots < createTicketDto.quantity) {
            throw new BadRequestException('No hay suficientes lugares disponibles');
        }

        const totalPrice = event.price * createTicketDto.quantity;
        const qrCode = uuidv4();

        const ticket = this.ticketsRepository.create({
            ...createTicketDto,
            totalPrice,
            qrCode,
            status: TicketStatus.PENDING,
        });

        // Actualizar lugares disponibles
        event.availableSpots -= createTicketDto.quantity;
        await this.eventsRepository.save(event);

        return this.ticketsRepository.save(ticket);
    }

    async findAll(): Promise<Ticket[]> {
        return this.ticketsRepository.find({
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({
            where: { id },
            relations: ['event'],
        });

        if (!ticket) {
            throw new NotFoundException('Ticket no encontrado');
        }

        return ticket;
    }

    async getStats(): Promise<DashboardStats> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tickets vendidos hoy (status PAID o USED)
        const ticketsSoldToday = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status IN (:...statuses)', { statuses: [TicketStatus.PAID, TicketStatus.USED] })
            .andWhere('ticket.purchaseDate >= :today', { today })
            .getCount();

        // Total de tickets vendidos
        const totalTicketsSold = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status IN (:...statuses)', { statuses: [TicketStatus.PAID, TicketStatus.USED] })
            .getCount();

        // Visitantes hoy (tickets usados hoy)
        const visitorsToday = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: TicketStatus.USED })
            .andWhere('ticket.usedDate >= :today', { today })
            .getCount();

        // Ingresos totales
        const revenueResult = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .select('SUM(ticket.totalPrice)', 'total')
            .where('ticket.status IN (:...statuses)', { statuses: [TicketStatus.PAID, TicketStatus.USED] })
            .getRawOne();

        const totalRevenue = parseFloat(revenueResult?.total) || 0;

        // Reservas pendientes (tickets pagados pero no usados)
        const upcomingReservations = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: TicketStatus.PAID })
            .getCount();

        return {
            ticketsSoldToday,
            totalTicketsSold,
            visitorsToday,
            totalRevenue,
            upcomingReservations,
        };
    }

    async getRecentValidations(limit: number = 10): Promise<Ticket[]> {
        return this.ticketsRepository.find({
            where: { status: TicketStatus.USED },
            relations: ['event'],
            order: { usedDate: 'DESC' },
            take: limit,
        });
    }

    async searchByEmail(email: string): Promise<Ticket[]> {
        return this.ticketsRepository.find({
            where: { customerEmail: email },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }

    async searchByDni(dni: string): Promise<Ticket[]> {
        return this.ticketsRepository.find({
            where: { customerDni: dni },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }

    async validateQr(qrCode: string): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
        const ticket = await this.ticketsRepository.findOne({
            where: { qrCode },
            relations: ['event'],
        });

        if (!ticket) {
            return { success: false, message: 'Ticket no encontrado' };
        }

        if (ticket.status === TicketStatus.USED || ticket.qrValidated) {
            return { success: false, message: 'Este ticket ya fue utilizado', ticket };
        }

        if (ticket.status !== TicketStatus.PAID) {
            return { success: false, message: 'Este ticket no está pagado', ticket };
        }

        // Marcar como usado
        ticket.status = TicketStatus.USED;
        ticket.qrValidated = true;
        ticket.usedDate = new Date();

        await this.ticketsRepository.save(ticket);

        return { success: true, message: 'Ticket validado correctamente', ticket };
    }
}

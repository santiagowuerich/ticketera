"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("../entities/ticket.entity");
const event_entity_1 = require("../entities/event.entity");
const crypto_1 = require("crypto");
let TicketsService = class TicketsService {
    constructor(ticketsRepository, eventsRepository) {
        this.ticketsRepository = ticketsRepository;
        this.eventsRepository = eventsRepository;
    }
    async create(createTicketDto) {
        const event = await this.eventsRepository.findOne({
            where: { id: createTicketDto.eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        if (event.availableTickets < createTicketDto.quantity) {
            throw new common_1.BadRequestException('No hay suficientes lugares disponibles');
        }
        const totalPrice = event.price * createTicketDto.quantity;
        const qrCode = (0, crypto_1.randomUUID)();
        const ticket = this.ticketsRepository.create({
            ...createTicketDto,
            totalPrice,
            qrCode,
            status: ticket_entity_1.TicketStatus.PENDING,
        });
        event.availableTickets -= createTicketDto.quantity;
        await this.eventsRepository.save(event);
        return this.ticketsRepository.save(ticket);
    }
    async findAll() {
        return this.ticketsRepository.find({
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const ticket = await this.ticketsRepository.findOne({
            where: { id },
            relations: ['event'],
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket no encontrado');
        }
        return ticket;
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ticketsSoldToday = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status IN (:...statuses)', { statuses: [ticket_entity_1.TicketStatus.PAID, ticket_entity_1.TicketStatus.USED] })
            .andWhere('ticket.purchaseDate >= :today', { today })
            .getCount();
        const totalTicketsSold = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status IN (:...statuses)', { statuses: [ticket_entity_1.TicketStatus.PAID, ticket_entity_1.TicketStatus.USED] })
            .getCount();
        const visitorsToday = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: ticket_entity_1.TicketStatus.USED })
            .andWhere('ticket.usedDate >= :today', { today })
            .getCount();
        const revenueResult = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .select('SUM(ticket.totalPrice)', 'total')
            .where('ticket.status IN (:...statuses)', { statuses: [ticket_entity_1.TicketStatus.PAID, ticket_entity_1.TicketStatus.USED] })
            .getRawOne();
        const totalRevenue = parseFloat(revenueResult?.total) || 0;
        const upcomingReservations = await this.ticketsRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: ticket_entity_1.TicketStatus.PAID })
            .getCount();
        return {
            ticketsSoldToday,
            totalTicketsSold,
            visitorsToday,
            totalRevenue,
            upcomingReservations,
        };
    }
    async getRecentValidations(limit = 10) {
        return this.ticketsRepository.find({
            where: { status: ticket_entity_1.TicketStatus.USED },
            relations: ['event'],
            order: { usedDate: 'DESC' },
            take: limit,
        });
    }
    async searchByEmail(email) {
        return this.ticketsRepository.find({
            where: { customerEmail: email },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }
    async searchByDni(dni) {
        return this.ticketsRepository.find({
            where: { customerDni: dni },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }
    async validateQr(qrCode) {
        const ticket = await this.ticketsRepository.findOne({
            where: { qrCode },
            relations: ['event'],
        });
        if (!ticket) {
            return { success: false, message: 'Ticket no encontrado' };
        }
        if (ticket.status === ticket_entity_1.TicketStatus.USED || ticket.qrValidated) {
            return { success: false, message: 'Este ticket ya fue utilizado', ticket };
        }
        if (ticket.status !== ticket_entity_1.TicketStatus.PAID) {
            return { success: false, message: 'Este ticket no está pagado', ticket };
        }
        ticket.status = ticket_entity_1.TicketStatus.USED;
        ticket.qrValidated = true;
        ticket.usedDate = new Date();
        await this.ticketsRepository.save(ticket);
        return { success: true, message: 'Ticket validado correctamente', ticket };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map
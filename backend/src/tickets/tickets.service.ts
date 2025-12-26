import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
import { Payment } from '../entities/payment.entity';
import { CreateTicketDto } from '../dto/tickets/create-ticket.dto';
import { EmailService } from '../services/email.service';
import { EventsService } from '../events/events.service';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private eventsService: EventsService,
  ) { }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    let { eventId, quantity } = createTicketDto;

    // Si no hay eventId o es 'default-event', usar o crear el evento por defecto
    let event: Event | null = null;

    if (!eventId || eventId === 'default-event') {
      event = await this.eventsService.getOrCreateDefaultEvent();
      eventId = event.id;
    } else {
      event = await this.eventRepository.findOne({
        where: { id: eventId, isActive: true },
      });
    }

    if (!event) {
      throw new NotFoundException('Event not found or not active');
    }

    // Verificar que hay suficientes tickets disponibles
    if (event.availableTickets < quantity) {
      throw new BadRequestException('Not enough tickets available');
    }

    // Calcular el precio total
    const totalPrice = event.price * quantity;

    // Crear el ticket (marcado como PAID ya que no usamos MercadoPago aún)
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      eventId: event.id, // Usar el eventId real
      totalPrice,
      currency: event.currency,
      status: TicketStatus.PAID,
      purchaseDate: new Date(),
      selectedDate: createTicketDto.selectedDate || null,
      selectedTime: createTicketDto.selectedTime || null,
      qrCode: null, // No generar QR aún
    });

    // Guardar el ticket primero para obtener el ID
    const savedTicket = await this.ticketRepository.save(ticket);

    // Generar QR Code con el ID real del ticket
    try {
      savedTicket.qrCode = await QRCode.toDataURL(savedTicket.id);
      await this.ticketRepository.update(savedTicket.id, { qrCode: savedTicket.qrCode });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }

    // Decrementar tickets disponibles del evento
    await this.eventRepository.decrement(
      { id: event.id },
      'availableTickets',
      quantity
    );

    // Enviar email de confirmación (no bloqueante)
    this.emailService.sendTicketConfirmation(savedTicket, event).catch((err) => {
      console.error('Failed to send confirmation email:', err);
    });

    return savedTicket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['event', 'payments'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async findByEmail(email: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { customerEmail: email },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByQrCode(qrCode: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { qrCode },
      relations: ['event'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async validateQrCode(code: string): Promise<{ success: boolean; message: string; ticket?: any }> {
    // Try to find by ticket ID first (for manual entry), then by qrCode (for QR scan)
    let ticket = await this.ticketRepository.findOne({
      where: { id: code, status: TicketStatus.PAID, qrValidated: false },
      relations: ['event'],
    });

    // If not found by ID, try by qrCode
    if (!ticket) {
      ticket = await this.ticketRepository.findOne({
        where: { qrCode: code, status: TicketStatus.PAID, qrValidated: false },
        relations: ['event'],
      });
    }

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket no encontrado, expirado o ya utilizado',
      };
    }

    // Verificar que el evento no haya terminado
    if (ticket.event.endDate < new Date()) {
      return {
        success: false,
        message: 'El evento ya ha terminado',
      };
    }

    // Marcar como usado
    await this.ticketRepository.update(ticket.id, {
      qrValidated: true,
      status: TicketStatus.USED,
      usedDate: new Date(),
    });

    return {
      success: true,
      message: 'Ticket validado correctamente',
      ticket: {
        id: ticket.id,
        customerName: ticket.customerName,
        eventTitle: ticket.event.title,
        quantity: ticket.quantity,
      },
    };
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    await this.ticketRepository.update(id, { status });
    return this.findOne(id);
  }

  async cancelTicket(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.PAID) {
      throw new BadRequestException('Only paid tickets can be cancelled');
    }

    // Devolver tickets al evento
    await this.eventRepository.increment(
      { id: ticket.eventId },
      'availableTickets',
      ticket.quantity
    );

    return this.updateStatus(id, TicketStatus.CANCELLED);
  }

  async getStats(): Promise<{
    ticketsSoldToday: number;
    totalTicketsSold: number;
    visitorsToday: number;
    totalRevenue: number;
    upcomingReservations: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tickets vendidos hoy
    const ticketsSoldToday = await this.ticketRepository.count({
      where: {
        status: TicketStatus.PAID,
        createdAt: require('typeorm').MoreThanOrEqual(today),
      },
    });

    // Total tickets vendidos (PAID + USED)
    const totalTicketsSold = await this.ticketRepository.count({
      where: [
        { status: TicketStatus.PAID },
        { status: TicketStatus.USED },
      ],
    });

    // Visitantes hoy (tickets validados/usados hoy)
    const visitorsToday = await this.ticketRepository.count({
      where: {
        status: TicketStatus.USED,
        usedDate: require('typeorm').MoreThanOrEqual(today),
      },
    });

    // Ingresos totales
    const revenueResult = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('SUM(ticket.totalPrice)', 'total')
      .where('ticket.status IN (:...statuses)', { statuses: [TicketStatus.PAID, TicketStatus.USED] })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Reservas pendientes (tickets pagados que aún no fueron usados)
    const upcomingReservations = await this.ticketRepository.count({
      where: {
        status: TicketStatus.PAID,
        qrValidated: false,
      },
    });

    return {
      ticketsSoldToday,
      totalTicketsSold,
      visitorsToday,
      totalRevenue,
      upcomingReservations,
    };
  }

  async getRecentValidations(limit: number = 10): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { status: TicketStatus.USED },
      relations: ['event'],
      order: { usedDate: 'DESC' },
      take: limit,
    });
  }

  async findByDni(dni: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { customerDni: dni },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }
}

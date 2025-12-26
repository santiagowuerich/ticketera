import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPaymentPreference(ticketId: string, successUrl?: string, failureUrl?: string, pendingUrl?: string) {
    // Verificar que el ticket existe y está pendiente
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['event'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.PENDING) {
      throw new BadRequestException('Ticket is not in pending status');
    }

    // SIMULACIÓN: Crear un pago simulado (sin MercadoPago por ahora)
    const payment = this.paymentRepository.create({
      ticketId,
      mercadopagoPreferenceId: `pref_${Date.now()}`,
      amount: ticket.totalPrice,
      currency: ticket.currency,
      status: PaymentStatus.APPROVED, // Simular pago aprobado
      payerEmail: ticket.customerEmail,
      payerIdentificationType: 'DNI',
      payerIdentificationNumber: ticket.customerDni,
      paymentDate: new Date(),
    });

    await this.paymentRepository.save(payment);

    // Marcar ticket como pagado
    await this.ticketRepository.update(ticketId, {
      status: TicketStatus.PAID,
      purchaseDate: new Date(),
    });

    return {
      preferenceId: `pref_${Date.now()}`,
      initPoint: `${successUrl || 'http://localhost:8080/success'}?ticket=${ticketId}`,
      ticketId,
      amount: ticket.totalPrice,
      currency: ticket.currency,
      message: 'Pago simulado exitosamente (MercadoPago no configurado)',
    };
  }

  async handleWebhook(paymentData: any) {
    // Webhook básico - por ahora solo log
    console.log('Webhook recibido:', paymentData);
    return { success: true, message: 'Webhook procesado (simulado)' };
  }

  async getPaymentStatus(ticketId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { ticketId },
      order: { createdAt: 'DESC' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}

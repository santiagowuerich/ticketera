import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  @Column({ name: 'mercadopago_payment_id', unique: true, nullable: true })
  mercadopagoPaymentId: string;

  @Column({ name: 'mercadopago_preference_id', nullable: true })
  mercadopagoPreferenceId: string;

  @Column({ name: 'mercadopago_merchant_order_id', nullable: true })
  mercadopagoMerchantOrderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @Column({ name: 'payer_email', nullable: true })
  payerEmail: string;

  @Column({ name: 'payer_identification_type', nullable: true })
  payerIdentificationType: string;

  @Column({ name: 'payer_identification_number', nullable: true })
  payerIdentificationNumber: string;

  @Column({ name: 'payment_date', type: 'timestamptz', nullable: true })
  paymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  get isCompleted(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }

  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  get canBeRefunded(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }
}


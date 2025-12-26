import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { Payment } from './payment.entity';

export enum TicketStatus {
  PENDING = 'pending',
  PAID = 'paid',
  USED = 'used',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_dni' })
  customerDni: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status: TicketStatus;

  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @Column({ name: 'qr_validated', default: false })
  qrValidated: boolean;

  @Column({ name: 'selected_date', nullable: true })
  selectedDate: string;

  @Column({ name: 'selected_time', nullable: true })
  selectedTime: string;

  @Column({ name: 'purchase_date', type: 'timestamptz', nullable: true })
  purchaseDate: Date;

  @Column({ name: 'used_date', type: 'timestamptz', nullable: true })
  usedDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Payment, (payment) => payment.ticket)
  payments: Payment[];

  get unitPrice(): number {
    return this.quantity > 0 ? Number(this.totalPrice) / this.quantity : 0;
  }

  get canBeUsed(): boolean {
    return this.status === TicketStatus.PAID && !this.qrValidated;
  }

  get isExpired(): boolean {
    if (!this.event) return false;
    return new Date() > this.event.endDate;
  }

  get isUsed(): boolean {
    return this.status === TicketStatus.USED || this.qrValidated;
  }
}


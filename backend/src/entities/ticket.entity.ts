import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Event } from './event.entity';
import { Payment } from './payment.entity';

export enum TicketStatus {
  PENDING = 'pending',
  PAID = 'paid',
  USED = 'used',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  // Datos del comprador (almacenados directamente en el ticket)
  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_dni' })
  customerDni: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING
  })
  status: TicketStatus;

  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @Column({ name: 'qr_validated', default: false })
  qrValidated: boolean;

  @Column({ name: 'selected_date', type: 'date', nullable: true })
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

  @ManyToOne(() => Event, event => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Payment, payment => payment.ticket)
  payments: Payment[];

  // Virtual properties
  get unitPrice(): number {
    return this.quantity > 0 ? this.totalPrice / this.quantity : 0;
  }

  get canBeUsed(): boolean {
    return this.status === TicketStatus.PAID &&
      !this.qrValidated &&
      this.event &&
      this.event.endDate > new Date();
  }

  get isExpired(): boolean {
    return this.event && this.event.endDate < new Date();
  }

  get isUsed(): boolean {
    return this.qrValidated || this.status === TicketStatus.USED;
  }
}

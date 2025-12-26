import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column()
  capacity: number;

  @Column({ name: 'available_tickets', default: 0 })
  availableTickets: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'ARS' })
  currency: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Ticket, ticket => ticket.event)
  tickets: Ticket[];

  // Virtual properties
  get isAvailable(): boolean {
    return this.isActive && this.availableTickets > 0 && this.endDate > new Date();
  }

  get soldTickets(): number {
    return this.capacity - this.availableTickets;
  }

  get occupancyRate(): number {
    return this.capacity > 0 ? (this.soldTickets / this.capacity) * 100 : 0;
  }
}

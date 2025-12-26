import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';
import { Payment } from '../entities/payment.entity';
import { EmailService } from '../services/email.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Event, Payment]),
    EventsModule,
  ],
  providers: [TicketsService, EmailService],
  controllers: [TicketsController]
})
export class TicketsModule { }


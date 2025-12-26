import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) { }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { isActive: true },
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, isActive: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  private static readonly DEFAULT_EVENT_TITLE = 'Entrada General';
  private static readonly DEFAULT_TICKET_PRICE = 2000;

  async findAvailable(): Promise<Event[]> {
    const { MoreThan } = require('typeorm');
    let events = await this.eventRepository.find({
      where: {
        isActive: true,
        availableTickets: MoreThan(0),
        endDate: MoreThan(new Date()),
      },
      order: { startDate: 'ASC' },
    });

    if (events.length === 0) {
      const defaultEvent = await this.getOrCreateDefaultEvent();
      events = [defaultEvent];
    }

    return events;
  }

  async getOrCreateDefaultEvent(): Promise<Event> {
    let event = await this.eventRepository.findOne({
      where: { title: EventsService.DEFAULT_EVENT_TITLE, isActive: true },
    });

    if (!event) {
      const now = new Date();
      const endDate = new Date(now.getFullYear() + 1, 11, 31);

      event = this.eventRepository.create({
        title: EventsService.DEFAULT_EVENT_TITLE,
        description: 'Acceso completo al Museo de la Cárcel - La Unidad. Recorre la historia y la arquitectura de este sitio emblemático.',
        shortDescription: 'Acceso completo al museo',
        location: 'Museo de la Cárcel - La Unidad',
        capacity: 10000,
        availableTickets: 10000,
        price: EventsService.DEFAULT_TICKET_PRICE,
        currency: 'ARS',
        startDate: now,
        endDate: endDate,
        isActive: true,
      });

      event = await this.eventRepository.save(event);
    }

    return event;
  }

  // ... rest of methods
}

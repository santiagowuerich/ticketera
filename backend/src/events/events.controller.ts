import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';
import { Public } from '../auth/public.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Public()
  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Public()
  @Get('available')
  async findAvailable(): Promise<Event[]> {
    return this.eventsService.findAvailable();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }
}

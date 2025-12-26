import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from '../entities/ticket.entity';
import { CreateTicketDto } from '../dto/tickets/create-ticket.dto';
import { ValidateQrDto } from '../dto/tickets/validate-qr.dto';
import { Public } from '../auth/public.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  // PUBLIC - Para compra de tickets
  @Public()
  @Post()
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  // PROTECTED - Solo admin (rutas específicas ANTES que :id)
  @Get()
  async findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.ticketsService.getStats();
  }

  @Get('recent-validations')
  async getRecentValidations(@Query('limit') limit?: string) {
    return this.ticketsService.getRecentValidations(limit ? parseInt(limit) : 10);
  }

  @Get('search')
  async findByEmail(@Query('email') email: string): Promise<Ticket[]> {
    return this.ticketsService.findByEmail(email);
  }

  @Get('search-dni')
  async findByDni(@Query('dni') dni: string): Promise<Ticket[]> {
    return this.ticketsService.findByDni(dni);
  }

  @Post('validate-qr')
  async validateQrCode(@Body() validateQrDto: ValidateQrDto) {
    return this.ticketsService.validateQrCode(validateQrDto.qrCode);
  }

  // PUBLIC - Para ver ticket después de compra (DEBE IR AL FINAL)
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }
}

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TicketsService, CreateTicketDto } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    // Crear ticket - público (para que usuarios puedan comprar)
    @Public()
    @Post()
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketsService.create(createTicketDto);
    }

    // Obtener todos los tickets - protegido (solo admin)
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }

    // Estadísticas del dashboard - protegido
    @UseGuards(JwtAuthGuard)
    @Get('stats')
    getStats() {
        return this.ticketsService.getStats();
    }

    // Validaciones recientes - protegido
    @UseGuards(JwtAuthGuard)
    @Get('recent-validations')
    getRecentValidations(@Query('limit') limit?: string) {
        return this.ticketsService.getRecentValidations(limit ? parseInt(limit, 10) : 10);
    }

    // Buscar por email - protegido
    @UseGuards(JwtAuthGuard)
    @Get('search')
    searchByEmail(@Query('email') email: string) {
        return this.ticketsService.searchByEmail(email);
    }

    // Buscar por DNI - protegido
    @UseGuards(JwtAuthGuard)
    @Get('search-dni')
    searchByDni(@Query('dni') dni: string) {
        return this.ticketsService.searchByDni(dni);
    }

    // Validar QR - protegido (para que admin pueda validar)
    @UseGuards(JwtAuthGuard)
    @Post('validate-qr')
    validateQr(@Body('qrCode') qrCode: string) {
        return this.ticketsService.validateQr(qrCode);
    }

    // Obtener un ticket específico - público (para ver confirmación)
    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }
}

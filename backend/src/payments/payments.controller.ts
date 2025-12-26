import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from '../dto/payments/create-payment.dto';
import { Public } from '../auth/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Public()
  @Post('create-preference')
  async createPreference(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPaymentPreference(
      createPaymentDto.ticketId,
      createPaymentDto.successUrl,
      createPaymentDto.failureUrl,
      createPaymentDto.pendingUrl,
    );
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() paymentData: any) {
    return this.paymentsService.handleWebhook(paymentData);
  }

  @Public()
  @Get('status/:ticketId')
  async getPaymentStatus(@Param('ticketId') ticketId: string) {
    return this.paymentsService.getPaymentStatus(ticketId);
  }
}

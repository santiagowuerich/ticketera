import { IsUUID, IsUrl, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  ticketId: string;

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  failureUrl?: string;

  @IsOptional()
  @IsUrl()
  pendingUrl?: string;
}

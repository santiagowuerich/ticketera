import { IsString, IsEmail, IsInt, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  eventId: string; // Can be a UUID or 'default-event'

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerDni: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsDateString()
  selectedDate?: string;

  @IsOptional()
  @IsString()
  selectedTime?: string;
}


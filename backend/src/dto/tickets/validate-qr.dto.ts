import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateQrDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}

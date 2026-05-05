import { IsString, IsUrl } from 'class-validator';

export class CreateTransmisionDto {
  @IsString()
  @IsUrl()
  url_enlace: string;
}

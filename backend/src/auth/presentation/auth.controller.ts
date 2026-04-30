import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProperty } from '@nestjs/swagger';
import { AuthService } from '../application/services/auth.service';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';

// DTOs de Swagger — clases independientes solo para documentación
class RegisterSwaggerDto {
  @ApiProperty({ example: 'Juan Pérez' }) nombre_completo: string;
  @ApiProperty({ example: 'juan@uninorte.edu.co' }) email: string;
  @ApiProperty({ example: '123456' }) password: string;
}

class LoginSwaggerDto {
  @ApiProperty({ example: 'juan@uninorte.edu.co' }) email: string;
  @ApiProperty({ example: '123456' }) password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  register(@Body() dto: RegisterSwaggerDto) {
    return this.authService.register(dto.nombre_completo, dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginSwaggerDto) {
    return this.authService.login(dto.email, dto.password);
  }
}

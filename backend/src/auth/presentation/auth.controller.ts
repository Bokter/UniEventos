import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../application/services/auth.service';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';

class VerifyEmailDto {
  email: string;
  code: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ── Visitantes ──────────────────────────────────────────
  @Post('register')
  @ApiOperation({ summary: 'Registro de visitantes (correo no Uninorte)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.nombre_completo, dto.email, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de visitantes (correo no Uninorte)' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ── Comunidad Uninorte ──────────────────────────────────
  @Post('register-uninorte')
  @ApiOperation({ summary: 'Registro de usuarios @uninorte.edu.co via Roble' })
  registerUninorte(@Body() dto: RegisterDto) {
    return this.authService.registerUninorte(dto.nombre_completo, dto.email, dto.password);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar código enviado al correo Uninorte' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('login-uninorte')
  @ApiOperation({ summary: 'Login de usuarios @uninorte.edu.co via Roble' })
  loginUninorte(@Body() dto: LoginDto) {
    return this.authService.loginUninorte(dto.email, dto.password);
  }
}

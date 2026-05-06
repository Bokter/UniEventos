import { Module, Global } from '@nestjs/common';
import { NotificacionesService } from './application/services/notificaciones.service';
import { ConsoleMailService } from './infrastructure/services/console-mail.service';
import { MAIL_SERVICE } from './domain/services/mail.service.interface';

@Global() // Lo hacemos global para facilitar su uso en todo el sistema
@Module({
  providers: [
    NotificacionesService,
    {
      provide: MAIL_SERVICE,
      useClass: ConsoleMailService,
    },
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}

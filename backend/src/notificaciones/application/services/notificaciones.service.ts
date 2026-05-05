import { Injectable, Inject } from '@nestjs/common';
import type { IMailService } from '../../domain/services/mail.service.interface';
import { MAIL_SERVICE } from '../../domain/services/mail.service.interface';

@Injectable()
export class NotificacionesService {
  constructor(
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
  ) {}

  async notificarCambioEstadoEvento(emailOrganizador: string, tituloEvento: string, nuevoEstado: string, observacion?: string) {
    const subject = `Tu evento "${tituloEvento}" ha cambiado de estado`;
    const template = 'cambio-estado-evento';
    const context = { tituloEvento, nuevoEstado, observacion };
    
    await this.mailService.sendMail(emailOrganizador, subject, template, context);
  }

  async notificarCancelacionAInteresados(emails: string[], tituloEvento: string) {
    const subject = `IMPORTANTE: El evento "${tituloEvento}" ha sido cancelado`;
    const template = 'evento-cancelado';
    const context = { tituloEvento };

    for (const email of emails) {
      await this.mailService.sendMail(email, subject, template, context);
    }
  }

  async notificarActualizacionAInteresados(emails: string[], tituloEvento: string) {
    const subject = `Actualización en el evento: "${tituloEvento}"`;
    const template = 'evento-actualizado';
    const context = { tituloEvento };

    for (const email of emails) {
      await this.mailService.sendMail(email, subject, template, context);
    }
  }
}

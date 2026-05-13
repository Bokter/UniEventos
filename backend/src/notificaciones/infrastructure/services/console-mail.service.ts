import { Injectable, Logger } from '@nestjs/common';
import { IMailService } from '../../domain/services/mail.service.interface';

@Injectable()
export class ConsoleMailService implements IMailService {
  private readonly logger = new Logger(ConsoleMailService.name);

  constructor() {
    this.logger.log('MailService inicializado en modo CONSOLA (EmailJS se encarga del envío real en el frontend)');
  }

  async sendMail(to: string, subject: string, template: string, context: any): Promise<void> {
    this.logger.log(`[SIMULACIÓN DE CORREO]
      Para: ${to}
      Asunto: ${subject}
      Plantilla: ${template}
      Contexto: ${JSON.stringify(context, null, 2)}
    `);
  }
}
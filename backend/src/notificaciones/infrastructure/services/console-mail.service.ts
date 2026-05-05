import { Injectable, Logger } from '@nestjs/common';
import { IMailService } from '../../domain/services/mail.service.interface';

@Injectable()
export class ConsoleMailService implements IMailService {
  private readonly logger = new Logger(ConsoleMailService.name);

  async sendMail(to: string, subject: string, template: string, context: any): Promise<void> {
    this.logger.log(`--------------------------------------------------`);
    this.logger.log(`SIMULANDO ENVÍO DE CORREO`);
    this.logger.log(`Para: ${to}`);
    this.logger.log(`Asunto: ${subject}`);
    this.logger.log(`Plantilla: ${template}`);
    this.logger.log(`Contexto: ${JSON.stringify(context, null, 2)}`);
    this.logger.log(`--------------------------------------------------`);
  }
}

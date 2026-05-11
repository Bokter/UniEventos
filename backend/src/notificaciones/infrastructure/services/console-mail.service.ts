import { Injectable, Logger } from '@nestjs/common';
import { IMailService } from '../../domain/services/mail.service.interface';

@Injectable()
export class ConsoleMailService implements IMailService {
  private readonly logger = new Logger(ConsoleMailService.name);

  async sendMail(to: string, subject: string, template: string, context: any): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM || 'noreply@unieventos.com';

    if (!apiKey) {
      this.logger.warn(`RESEND_API_KEY no configurada. Simulando envío a ${to}: ${subject}`);
      return;
    }

    const html = this.buildHtml(template, context);

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html }),
      });

      if (!res.ok) {
        const err = await res.json();
        this.logger.error(`Error enviando correo: ${JSON.stringify(err)}`);
      } else {
        this.logger.log(`Correo enviado a ${to}: ${subject}`);
      }
    } catch (error) {
      this.logger.error(`Fallo al enviar correo: ${error}`);
    }
  }

  private buildHtml(template: string, context: any): string {
    const estilos = `
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9f9f9;
    `;
    const estilosBox = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      border-left: 4px solid #0A2540;
    `;

    switch (template) {
      case 'cambio-estado-evento':
        return `
          <div style="${estilos}">
            <div style="${estilosBox}">
              <h2 style="color:#0A2540">UniEventos — Estado de tu evento</h2>
              <p>Tu evento <strong>${context.tituloEvento}</strong> ha cambiado de estado a: 
                <strong style="color:#1D9E75">${context.nuevoEstado}</strong>
              </p>
              ${context.observacion ? `<p><strong>Observación del administrador:</strong> ${context.observacion}</p>` : ''}
              <p style="color:#888;font-size:12px">Universidad del Norte — UniEventos</p>
            </div>
          </div>`;

      case 'evento-cancelado':
        return `
          <div style="${estilos}">
            <div style="${estilosBox}">
              <h2 style="color:#c0392b">UniEventos — Evento cancelado</h2>
              <p>El evento <strong>${context.tituloEvento}</strong> que tenías en favoritos ha sido <strong>cancelado</strong>.</p>
              <p>Visita UniEventos para descubrir otros eventos disponibles.</p>
              <p style="color:#888;font-size:12px">Universidad del Norte — UniEventos</p>
            </div>
          </div>`;

      case 'evento-actualizado':
        return `
          <div style="${estilos}">
            <div style="${estilosBox}">
              <h2 style="color:#0A2540">UniEventos — Evento actualizado</h2>
              <p>El evento <strong>${context.tituloEvento}</strong> que tenías en favoritos ha sido actualizado.</p>
              <p>Ingresa a UniEventos para ver los últimos detalles.</p>
              <p style="color:#888;font-size:12px">Universidad del Norte — UniEventos</p>
            </div>
          </div>`;

      case 'verificacion-registro':
        return `
          <div style="${estilos}">
            <div style="${estilosBox}">
              <h2 style="color:#0A2540">Bienvenido a UniEventos</h2>
              <p>Hola <strong>${context.nombre}</strong>, tu registro fue exitoso.</p>
              <p>Ya puedes explorar todos los eventos del campus de la Universidad del Norte.</p>
              <p style="color:#888;font-size:12px">Universidad del Norte — UniEventos</p>
            </div>
          </div>`;

      default:
        return `<p>${JSON.stringify(context)}</p>`;
    }
  }
}
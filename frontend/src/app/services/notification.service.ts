import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Servicio para el envío de correos electrónicos desde el frontend usando EmailJS.
 */
export const notificationService = {
  /**
   * Envía un correo electrónico usando una plantilla preconfigurada en EmailJS.
   * @param templateParams Parámetros requeridos por la plantilla (nombre, email, mensaje, etc.)
   */
  async sendEmail(templateParams: Record<string, any>) {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn('EmailJS no está configurado correctamente en las variables de entorno.');
      return { success: false, error: 'Configuración faltante' };
    }

    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      console.log('Correo enviado exitosamente:', response.status, response.text);
      return { success: true, response };
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return { success: false, error };
    }
  },

  /**
   * Ejemplo de envío de bienvenida
   */
  async sendWelcomeEmail(userName: string, userEmail: string) {
    return this.sendEmail({
      to_name: userName,
      to_email: userEmail,
      message: '¡Bienvenido a UniEventos! Tu registro ha sido exitoso.',
      subject: 'Bienvenido a UniEventos'
    });
  }
};

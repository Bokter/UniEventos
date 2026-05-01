export interface IMailService {
  sendMail(to: string, subject: string, template: string, context: any): Promise<void>;
}

export const MAIL_SERVICE = 'MAIL_SERVICE';

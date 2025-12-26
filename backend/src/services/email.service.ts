import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../entities/ticket.entity';
import { Event } from '../entities/event.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Configure email transporter
    // For development, we'll use a test SMTP service or log the email
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '465'),
        secure: smtpPort === '465', // True for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Use console log for development (no real email sent)
      this.logger.warn('SMTP not configured - emails will be logged to console');
    }
  }

  async sendTicketConfirmation(ticket: Ticket, event: Event): Promise<void> {
    const emailContent = this.generateTicketEmail(ticket, event);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get('SMTP_FROM') || '"Museo La Unidad" <noreply@museo.com>',
          to: ticket.customerEmail,
          subject: `🎟️ Tu entrada para ${event.title} - Confirmación`,
          html: emailContent,
        });
        this.logger.log(`Email sent to ${ticket.customerEmail} for ticket ${ticket.id}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${ticket.customerEmail}:`, error);
        // Don't throw - email failure shouldn't break the purchase flow
      }
    } else {
      // Development mode - log the email
      this.logger.log(`
========== EMAIL CONFIRMATION ==========
To: ${ticket.customerEmail}
Subject: 🎟️ Tu entrada para ${event.title} - Confirmación

Customer: ${ticket.customerName}
Event: ${event.title}
Tickets: ${ticket.quantity}
Total: $${ticket.totalPrice} ${ticket.currency}
Ticket ID: ${ticket.id}
========================================
      `);
    }
  }

  private generateTicketEmail(ticket: Ticket, event: Event): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Entrada - ${event.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #b45309 0%, #92400e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎟️ ¡Compra Confirmada!</h1>
      <p style="color: #fcd34d; margin: 10px 0 0 0;">Tu entrada está lista</p>
    </div>

    <!-- Content -->
    <div style="background-color: #262626; padding: 30px; border-radius: 0 0 16px 16px;">
      <h2 style="color: #ffffff; margin: 0 0 20px 0;">${event.title}</h2>
      
      <div style="background-color: #333333; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #9ca3af; padding: 8px 0;">Nombre:</td>
            <td style="color: #ffffff; text-align: right; padding: 8px 0;">${ticket.customerName}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 8px 0;">DNI:</td>
            <td style="color: #ffffff; text-align: right; padding: 8px 0;">${ticket.customerDni}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 8px 0;">Cantidad:</td>
            <td style="color: #ffffff; text-align: right; padding: 8px 0;">${ticket.quantity} entrada(s)</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; padding: 8px 0;">Total:</td>
            <td style="color: #fcd34d; font-weight: bold; text-align: right; padding: 8px 0;">$${ticket.totalPrice.toLocaleString('es-AR')} ${ticket.currency}</td>
          </tr>
        </table>
      </div>

      <!-- Ticket ID -->
      <div style="background-color: #333333; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">ID del Ticket</p>
        <p style="color: #ffffff; font-family: monospace; font-size: 16px; margin: 0; word-break: break-all;">${ticket.id}</p>
      </div>

      <!-- Ticket Code -->
      <div style="text-align: center; padding: 30px; background-color: #ffffff; border-radius: 12px; margin-bottom: 20px;">
        <p style="color: #333333; margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">Presentá este código en la entrada:</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 10px 0;">
          <p style="color: #1a1a1a; font-family: monospace; font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 1px; word-break: break-all;">\${ticket.id}</p>
        </div>
        <p style="color: #666666; margin: 15px 0 0 0; font-size: 13px;">También podés mostrar el código QR desde la página de confirmación</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #404040;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          ¿Tenés preguntas? Contactanos a <a href="mailto:info@museo.com" style="color: #b45309;">info@museo.com</a>
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
          © ${new Date().getFullYear()} Museo de la Cárcel - La Unidad
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

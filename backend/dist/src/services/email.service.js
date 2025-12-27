"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = this.configService.get('SMTP_PORT');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        if (smtpHost && smtpUser && smtpPass) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort || '465'),
                secure: smtpPort === '465',
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
        }
        else {
            this.logger.warn('SMTP not configured - emails will be logged to console');
        }
    }
    async sendTicketConfirmation(ticket, event) {
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
            }
            catch (error) {
                this.logger.error(`Failed to send email to ${ticket.customerEmail}:`, error);
            }
        }
        else {
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
    generateTicketEmail(ticket, event) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
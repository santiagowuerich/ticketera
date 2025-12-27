"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const ticket_entity_1 = require("./ticket.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["APPROVED"] = "approved";
    PaymentStatus["REJECTED"] = "rejected";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
    get isCompleted() {
        return this.status === PaymentStatus.APPROVED;
    }
    get isPending() {
        return this.status === PaymentStatus.PENDING;
    }
    get canBeRefunded() {
        return this.status === PaymentStatus.APPROVED;
    }
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_id' }),
    __metadata("design:type", String)
], Payment.prototype, "ticketId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mercadopago_payment_id', unique: true, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "mercadopagoPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mercadopago_preference_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "mercadopagoPreferenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mercadopago_merchant_order_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "mercadopagoMerchantOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ARS' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethodId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payer_email', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "payerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payer_identification_type', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "payerIdentificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payer_identification_number', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "payerIdentificationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_entity_1.Ticket, (ticket) => ticket.payments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ticket_id' }),
    __metadata("design:type", ticket_entity_1.Ticket)
], Payment.prototype, "ticket", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map
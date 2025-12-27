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
exports.Ticket = exports.TicketStatus = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const payment_entity_1 = require("./payment.entity");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["PENDING"] = "pending";
    TicketStatus["PAID"] = "paid";
    TicketStatus["USED"] = "used";
    TicketStatus["CANCELLED"] = "cancelled";
    TicketStatus["REFUNDED"] = "refunded";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
let Ticket = class Ticket {
    get unitPrice() {
        return this.quantity > 0 ? Number(this.totalPrice) / this.quantity : 0;
    }
    get canBeUsed() {
        return this.status === TicketStatus.PAID && !this.qrValidated;
    }
    get isExpired() {
        if (!this.event)
            return false;
        return new Date() > this.event.endDate;
    }
    get isUsed() {
        return this.status === TicketStatus.USED || this.qrValidated;
    }
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_id' }),
    __metadata("design:type", String)
], Ticket.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name' }),
    __metadata("design:type", String)
], Ticket.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email' }),
    __metadata("design:type", String)
], Ticket.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_dni' }),
    __metadata("design:type", String)
], Ticket.prototype, "customerDni", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_phone', nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Ticket.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Ticket.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ARS' }),
    __metadata("design:type", String)
], Ticket.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.PENDING,
    }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code', unique: true, nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_validated', default: false }),
    __metadata("design:type", Boolean)
], Ticket.prototype, "qrValidated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selected_date', nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "selectedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selected_time', nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "selectedTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Ticket.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Ticket.prototype, "usedDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Ticket.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Ticket.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.tickets, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], Ticket.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.ticket),
    __metadata("design:type", Array)
], Ticket.prototype, "payments", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)('tickets')
], Ticket);
//# sourceMappingURL=ticket.entity.js.map
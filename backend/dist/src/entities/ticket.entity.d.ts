import { Event } from './event.entity';
import { Payment } from './payment.entity';
export declare enum TicketStatus {
    PENDING = "pending",
    PAID = "paid",
    USED = "used",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class Ticket {
    id: string;
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerDni: string;
    customerPhone: string;
    quantity: number;
    totalPrice: number;
    currency: string;
    status: TicketStatus;
    qrCode: string;
    qrValidated: boolean;
    selectedDate: string;
    selectedTime: string;
    purchaseDate: Date;
    usedDate: Date;
    createdAt: Date;
    updatedAt: Date;
    event: Event;
    payments: Payment[];
    get unitPrice(): number;
    get canBeUsed(): boolean;
    get isExpired(): boolean;
    get isUsed(): boolean;
}

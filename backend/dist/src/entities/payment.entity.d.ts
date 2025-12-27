import { Ticket } from './ticket.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class Payment {
    id: string;
    ticketId: string;
    mercadopagoPaymentId: string;
    mercadopagoPreferenceId: string;
    mercadopagoMerchantOrderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string;
    paymentMethodId: string;
    payerEmail: string;
    payerIdentificationType: string;
    payerIdentificationNumber: string;
    paymentDate: Date;
    createdAt: Date;
    updatedAt: Date;
    ticket: Ticket;
    get isCompleted(): boolean;
    get isPending(): boolean;
    get canBeRefunded(): boolean;
}

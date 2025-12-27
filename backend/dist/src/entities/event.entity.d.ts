import { Ticket } from './ticket.entity';
export declare class Event {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    imageUrl: string;
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    availableTickets: number;
    price: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    tickets: Ticket[];
    get isAvailable(): boolean;
    get soldTickets(): number;
    get occupancyRate(): number;
}

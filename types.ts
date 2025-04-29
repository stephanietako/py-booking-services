export interface User {
  id: string;
  email: string;
  name: string;
  description?: string;
  image?: string;
  clerkUserId: string;
  createdAt: Date;
  roleId: string;
  role?: Role; // Include the role relation
  bookings?: Booking[];
  stripeCustomerId?: string;
}

export interface Role {
  id: string;
  name: string;
  users?: User[]; // Utilise le type User que tu as défini
}

export interface Service {
  id: string;
  name: string;
  amount: number;
  categories: string[];
  description?: string;
  imageUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  // pricingRules?: PricingRule[]; // Utilise le type PricingRule
  price: number;
  defaultPrice: number;
  currency: string;
  isFixed: boolean;
}

export interface Option {
  id: string;
  description: string;
  amount: number;
  serviceId?: string;
  service?: Service; // Include service relation if you need it
  createdAt: Date;
  bookingId?: number;
  booking?: Booking; // Include booking relation if needed
}

export interface DayInput {
  id: string;
  name: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface CloseDayInput {
  date: Date;
}

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export interface Booking {
  id: number;
  clientId: number;
  client?: Client; // Uncomment if you want to include Client object in the booking
  status: BookingStatus;
  approvedByAdmin: boolean;
  reservedAt: Date;
  startTime: Date;
  endTime: Date;
  withCaptain: boolean;
  boatAmount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  service: Service | null;
  options?: Option[]; // Include options if needed
  transactions?: Transaction[]; // Include transactions if needed
}

export interface PricingRule {
  id: string;
  serviceId: string;
  service?: Service; // Optional, include if needed
  startDate: Date;
  endDate: Date;
  price: number;
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  bookings?: Booking[]; // Optional, as it's a relation
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
  bookingId?: number;
  booking?: Booking; // Include if you need to refer to a booking in the transaction
}

export interface ClosedDay {
  id: string;
  date: Date;
  createdAt: Date;
}

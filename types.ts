export interface Role {
  id: string;
  name: string;
  users: User[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  description?: string | null;
  clerkUserId: string;
  roleId: string;
  role?: Role;
  stripeCustomerId?: string | null;
  createdAt: Date;
  bookings?: Booking[];
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
}

export interface PricingRule {
  id: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  service?: Service;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  active: boolean;
  categories: string[];
  defaultPrice: number;
  isFixed: boolean;
  createdAt: Date;
  updatedAt: Date;
  reservedAt: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  currency: string;
  stripeCustomerId?: string | null;
  pricingRules?: PricingRule[];
  bookings?: Booking[];
  amount: number;
  price: number;
  requiresCaptain: boolean;
}

export interface Option {
  id: string;
  name: string;
  label: string;
  amount: number;
  payableOnline: boolean;
  payableAtBoard: boolean; // Ajoute cette propriété
  createdAt: Date;
  description?: string | null;
  unitPrice: number;
}

export interface BookingOption {
  id: string;
  optionId: string;
  bookingId: number;
  quantity: number;
  unitPrice: number;
  label: string;
  option?: Option;
  description?: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
  bookingId?: number | null;
  paymentStatus: PaymentStatus;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  approvedByAdmin: boolean;
  reservedAt: Date;
  startTime: Date;
  endTime: Date;
  withCaptain: boolean;
  boatAmount: number;
  payableOnBoard: number;
  totalAmount: number;
  expiresAt: Date;
  updatedAt: Date;
  createdAt: Date;
  stripePaymentLink: string | null;
  clientId: number | null;
  client?: Client | null; // Rendre la propriété `client` optionnelle
  userId: string | null;
  user?: User | null;
  serviceId: string | null;
  service?: Service;
  bookingOptions?: BookingOption[];
  transactions?: Transaction[];
  mealOption: boolean;
}

// export interface BookingWithDetails extends Booking {
//   service: Service;
//   bookingOptions: BookingOption[];
//   client: Client;
// }
// Remplacez votre BookingWithDetails existant par celui-ci
export interface BookingWithDetails extends Booking {
  Service: Service;
  client: Client;
  bookingOptions: (BookingOption & { option: Option })[];
  user?: User | null;
}

export interface Day {
  id: string;
  name: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface ClosedDay {
  id: string;
  date: Date;
  createdAt: Date;
}

export type CreateBookingPayload = {
  clerkUserId: string;
  serviceId: string;
  reservedAt: string;
  startTime: string;
  endTime: string;
  withCaptain?: boolean;
  boatAmount?: number;
  options?: {
    optionId: string;
    quantity: number;
  }[];
};

export interface CustomUser {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses: { emailAddress: string }[];
  email?: string;
  imageUrl?: string;
  image?: string;
  name?: string;
  description?: string | null;
  role?: { name: string };
  stripeCustomerId?: string | null;
}

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type DateTime = {
  justDate: Date | null; // Stocke uniquement une date sans heure.
  dateTime?: Date | null; // Stocke une date avec l'heure.
};

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

export interface OptionWithAmount {
  optionId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  description: string | null;
  amount: number;
  createdAt: Date;
  id: string;
}

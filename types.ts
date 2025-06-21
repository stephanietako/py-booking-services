import type { JwtPayload } from "jsonwebtoken";

export interface Role {
  id: string;
  name: string;
  users: User[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string | null;
  image?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
  clerkUserId: string;
  roleId: string;
  role?: Role;
  stripeCustomerId?: string | null;
  createdAt: Date;
  bookings?: Booking[];
  client?: Client | null;
  updatedAt?: Date;
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
  userId?: string | null;
  user?: User | null;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  service?: Service | null;
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
  deposit?: number;
  captainPrice?: number;
}

export interface Option {
  id: string;
  name: string;
  label: string;
  amount: number;
  payableOnline: boolean;
  payableAtBoard: boolean;
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
  client?: Client | null;
  userId: string | null;
  user?: User | null;
  serviceId: string | null;
  service?: Service | null;
  bookingOptions?: BookingOption[] | null;
  transactions?: Transaction[] | null;
  mealOption: boolean;
  description?: string | null;
}

export interface BookingWithDetails extends Omit<Booking, "bookingOptions"> {
  service?: Service | null;
  client?: Client | null;
  user?: User | null;
  phoneNumber?: string | null;
  bookingOptions: (BookingOption & { option: Option })[];
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

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAID"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

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

export interface DetailedBookingOption {
  id: string;
  optionId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  description?: string | null;
  amount: number;
  createdAt: Date;
}

export interface RequestConfirmationEmailParams {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  boatAmount: number;
  mealOption: boolean;
  withCaptain: boolean;
  captainPrice: number;
  totalPayableOnBoardCalculated: number;
  cautionAmount: number;
  bookingOptions: DetailedBookingOption[];
  comment?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface FormState {
  name: string;
  email: string;
  description: string;
  phoneNumber: string;
}

export interface BookingTokenPayload extends JwtPayload {
  bookingId: number;
  clientId?: number | null; // Accepte null ET undefined
  userId?: string | null; // Accepte null ET undefined
}

export type BookingForInvoice = Booking & {
  service: Service;
  client?: Client | null;
  user?: User | null;
  bookingOptions: (BookingOption & { option: Option })[];
  totalPayableOnBoardCalculated: number;
  clientFullName: string;
  clientEmail: string;
  clientPhoneNumber: string;
};

export interface ClerkEmailAddress {
  email_address: string;
}

export interface ClerkUserPayload {
  id: string;
  object: "user";
  first_name: string;
  last_name: string;
  email_addresses: ClerkEmailAddress[];
  image_url?: string;
}

export interface ClerkWebhookEvent {
  object: "event";
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserPayload;
}

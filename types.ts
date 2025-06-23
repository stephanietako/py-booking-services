import type { JwtPayload } from "jsonwebtoken";
import type { BookingStatus, PaymentStatus } from "@prisma/client";

export type RoleName = "admin" | "user" | "member";

export interface Role {
  id: string;
  name: RoleName;
  users: User[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string | null;
  image?: string | null;
  phoneNumber: string;
  description?: string | null;
  clerkUserId: string;
  roleId: string;
  role?: Role;
  stripeCustomerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
  client?: Client | null;
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
  stripeCustomerId?: string | null;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  price: number;
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
  captainPrice: number;
  cautionAmount: number;
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
  amount: number;
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
  bookingOptions?: BookingOption[];
  transactions?: Transaction[];
  mealOption: boolean;
  description: string;
  email: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus: PaymentStatus;
  invoiceSent?: boolean | null;
}

export interface BookingWithDetails extends Omit<Booking, "bookingOptions"> {
  service?: Service | null;
  client?: Client | null;
  user?: User | null;
  phoneNumber: string;
  bookingOptions: (BookingOption & { option: Option })[];
  transactions: Transaction[];
  clientFullName?: string;
  clientEmail?: string;
  clientPhoneNumber?: string;
  totalPayableOnBoardCalculated?: number;
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
  role?: { name: RoleName };
  stripeCustomerId?: string | null;
}

export type DateTime = {
  justDate: Date | null;
  dateTime?: Date | null;
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
  clientId?: number | null;
  userId?: string | null;
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

export interface VerifyTokenResponse {
  data: BookingWithDetails;
}

// ✅ Réexportation des types Prisma pour éviter l'erreur :
export type { BookingStatus, PaymentStatus } from "@prisma/client";

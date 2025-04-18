export interface User {
  id: string;
  email: string;
  name: string;
  description?: string | null;
  image?: string | null;
  clerkUserId: string;
  createdAt: Date;
  roleId?: string | null;
  role?: { name: string };
  services?: Service[];
  stripeCustomerId?: string | null;
  termsAcceptedAt: Date | null;
}

export interface Role {
  id: string;
  name: string;
  users?: User[];
}

export type Service = {
  id: string;
  name: string;
  amount: number;
  categories: string[]; // Utilisation d'un tableau de chaînes
  description: string | null;
  imageUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  reservedAt: Date | null;
  startTime?: Date | null;
  endTime?: Date | null;
  options?: Option[];
  bookings?: Booking[]; // Marquer `bookings` comme optionnel
  price: number;
  currency: string;
  stripeCustomerId?: string | null;
  defaultPrice?: number; // Prix par défaut pour les services fixes
  isFixed: boolean; // Indiquer si c'est un service fixe ou dynamique
  pricingRules?: PricingRule[]; // Règles de tarification pour services fixes
  totalAmount?: number;
};

export interface Option {
  id: string; // L'ID est de type UUID (généré automatiquement)
  amount: number; // Montant de la transaction
  description: string;
  createdAt?: Date; // Date de création (DateTime dans Prisma)
  serviceId?: string | null; // serviceId peut être null ou défini
  service?: Service | null; // Objet Service optionnel, peut être null
  bookings?: Booking[]; // Réservations associées à la transaction
}

export interface CustomUser {
  id: string;
  firstName?: string;
  lastName?: string;
  description?: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl?: string;
  image?: string;
  email?: string;
  name?: string;
  role?: { name: string };
  stripeCustomerId?: string | null;
}

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

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  service: Service; // Service réservé par l'utilisateur
  user: User; // Utilisateur qui a fait la réservation
  createdAt: Date;
  updatedAt: Date;
  startTime: Date;
  endTime: Date;
  reservedAt: Date | null;
  expiresAt: Date | null; // Permettre à expiresAt d'être null,Date de création de la réservation
  options?: Option[]; // Liste des options ajoutées à la réservation
  status: BookingStatus; // Statut de la réservation
  approvedByAdmin: boolean; // Indique si la réservation a été approuvée par un admin
  amount?: number;
  totalAmount: number;
  stripeCustomerId?: string | null;
  stripePaymentIntentId?: string | null;
  price?: string | null;
  token?: string;
  termsAcceptedAt?: Date | null;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  price: number;
}

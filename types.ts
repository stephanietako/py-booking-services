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
  transactions?: Transaction[];
  bookings?: Booking[]; // Marquer `bookings` comme optionnel
};

export interface Transaction {
  id: string; // L'ID est de type UUID (généré automatiquement)
  amount: number; // Montant de la transaction
  description?: string; // Description optionnelle
  createdAt: Date; // Date de création (DateTime dans Prisma)
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
}

export type DateTime = {
  justDate: Date | null; // Stocke uniquement une date sans heure.
  dateTime: Date | null; // Stocke une date avec l'heure.
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

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  service: Service; // Service réservé par l'utilisateur
  user: User; // Utilisateur qui a fait la réservation
  createdAt: Date; // Date de création de la réservation
  transactions?: Transaction[]; // Liste des options ajoutées à la réservation
  status: string; // Statut de la réservation
}

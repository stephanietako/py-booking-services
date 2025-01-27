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
  description: string | null;
  imageUrl: string;
  userId: string | null; // Le userId peut être nul
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  transactions: {
    id: string;
    amount: number;
    createdAt: Date;
    description: string;
    serviceId: string | null;
  }[];
};

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  createdAt: Date;
  serviceId?: string | null;
  service?: Service | null;
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

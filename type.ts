export interface User {
  id: string;
  email: string;
  name: string;
  description?: string;
  image: string;
  isAdmin?: boolean;
  clerkUserId: string;
  createdAt: Date;
  roleId?: string | null;
  role?: Role | null;
  services?: Service[];
}

export interface Role {
  id: string;
  name: string;
  users?: User[];
}

export interface Service {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  amount: number;
  description?: string | null;
  imageUrl: string;
  active: boolean;
  userId: string;
  user?: User;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  createdAt: Date;
  serviceId?: string | null;
  service?: Service | null;
}

export type DateTime = {
  justDate: Date | null;
  dateTime: Date | null;
};

export interface CustomUser {
  id: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl?: string;
  image?: string;
  email?: string;
  name?: string;
  role?: Role | null;
}

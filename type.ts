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
  description?: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl?: string;
  image?: string;
  email?: string;
  name?: string;
  role?: { name: string };
}

/////////
// export interface Role {
//   name: string;
//   id?: string;
// }

// export interface Service {
//   id: string;
//   name: string;
//   amount: number;
//   description?: string | null;
//   imageUrl: string;
//   active: boolean;
//   createdAt: Date;
// }

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   description?: string | null;
//   image: string;
//   clerkUserId: string;
//   createdAt: Date;
//   roleId?: string | null;
//   role?: Role; // Utilisation de l'interface complète
//   services?: Service[];
// }

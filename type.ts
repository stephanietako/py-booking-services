export interface Service {
  id: string;
  createdAt: Date;
  name: string;
  amount: number;
  description: string;
  imageUrl: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  createdAt: Date;
  serviceName?: string;
  serviceId?: string | null;
}

export type DateTime = {
  justDate: Date | null;
  dateTime: Date | null;
};

type BookingOptionInput = {
  label: string;
  unitPrice: number;
  quantity: number;
  payableAtBoard: boolean;
};

type CalculateBookingParams = {
  basePrice: number;
  withCaptain: boolean; // true = a son propre capitaine, false = veut un capitaine
  captainPrice: number;
  selectedOptions: BookingOptionInput[];
};

type BookingTotal = {
  totalAmount: number; // Le montant total global (bateau + toutes options)
  payableOnBoard: number; // Le montant total des options payables sur place (y compris le capitaine si sollicité)
  // Il pourrait être utile d'ajouter un 'payableOnline' si vous voulez le stocker explicitement
};
export function calculateBookingTotal({
  basePrice,
  withCaptain,
  captainPrice,
  selectedOptions,
}: CalculateBookingParams): BookingTotal {
  let totalAmount = basePrice; // Le prix du bateau
  let payableOnBoard = 0;
  let payableOnlineOptions = 0; // Nouveau pour les options payables en ligne

  // Si le client n'a PAS son propre capitaine, le prix du capitaine est ajouté aux options payables à bord
  if (!withCaptain) {
    // Si withCaptain est false, le client sollicite votre capitaine
    payableOnBoard += captainPrice;
  }

  for (const opt of selectedOptions) {
    const optTotal = opt.unitPrice * opt.quantity;

    if (opt.payableAtBoard) {
      payableOnBoard += optTotal;
    } else {
      payableOnlineOptions += optTotal;
    }
  }

  // Le totalAmount global devrait inclure le prix du bateau + toutes les options (online + on-board)
  totalAmount = basePrice + payableOnlineOptions + payableOnBoard;

  return { totalAmount, payableOnBoard };
}

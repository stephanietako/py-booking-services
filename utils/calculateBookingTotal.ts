// type BookingOptionInput = {
//   label: string;
//   unitPrice: number;
//   quantity: number;
//   payableAtBoard: boolean;
// };

// type CalculateBookingParams = {
//   basePrice: number;
//   withCaptain: boolean;
//   captainPrice: number;
//   selectedOptions: BookingOptionInput[];
// };

// type BookingTotal = {
//   totalAmount: number;
//   payableOnBoard: number;

// };
// export function calculateBookingTotal({
//   basePrice,
//   withCaptain,
//   captainPrice,
//   selectedOptions,
// }: CalculateBookingParams): BookingTotal {
//   let totalAmount = basePrice; // Le prix du bateau
//   let payableOnBoard = 0;
//   let payableOnlineOptions = 0; // Nouveau pour les options payables en ligne

//   // Si le client n'a PAS son propre capitaine, le prix du capitaine est ajouté aux options payables à bord
//   if (!withCaptain) {
//     // Si withCaptain est false, le client sollicite un capitaine
//     payableOnBoard += captainPrice;
//   }

//   for (const opt of selectedOptions) {
//     const optTotal = opt.unitPrice * opt.quantity;

//     if (opt.payableAtBoard) {
//       payableOnBoard += optTotal;
//     } else {
//       payableOnlineOptions += optTotal;
//     }
//   }

//   // Le totalAmount global devrait inclure le prix du bateau + toutes les options (online + on-board)
//   totalAmount = basePrice + payableOnlineOptions + payableOnBoard;

//   return { totalAmount, payableOnBoard };
// }

type BookingOptionInput = {
  label: string;
  unitPrice: number;
  quantity: number;
  payableAtBoard: boolean;
};

type CalculateBookingParams = {
  basePrice: number;
  withCaptain: boolean;
  captainPrice: number;
  selectedOptions: BookingOptionInput[];
};

type BookingTotal = {
  totalAmount: number;
  payableOnBoard: number;
};

export function calculateBookingTotal({
  basePrice,
  withCaptain,
  captainPrice,
  selectedOptions,
}: CalculateBookingParams): BookingTotal {
  let payableOnBoard = 0;
  let payableOnlineOptions = 0;

  // LOGIQUE CAPITAINE CORRIGÉE :
  // withCaptain = false → client n'a pas de capitaine → il sollicite un capitaine → il paye 350€ (payable à bord)
  // withCaptain = true → client a son propre capitaine → il ne paye pas de frais de capitaine
  if (!withCaptain) {
    // Le client sollicite un capitaine, donc frais de capitaine payable à bord
    payableOnBoard += captainPrice;
  }
  // Si withCaptain = true, aucun frais de capitaine n'est ajouté

  // Calcul des options
  for (const opt of selectedOptions) {
    const optTotal = opt.unitPrice * opt.quantity;

    if (opt.payableAtBoard) {
      payableOnBoard += optTotal;
    } else {
      payableOnlineOptions += optTotal;
    }
  }

  // MONTANT TOTAL = prix bateau + options payables en ligne + tout ce qui est payable à bord
  const totalAmount = basePrice + payableOnlineOptions + payableOnBoard;

  return {
    totalAmount, // Montant total indicatif (bateau + options + capitaine si applicable)
    payableOnBoard, // Montant payable à bord (capitaine si sollicité + options payables à bord)
  };
}

// // Exemple d'utilisation :
// const exemple1 = calculateBookingTotal({
//   basePrice: 1000,      // Prix du bateau
//   withCaptain: false,   // Client sollicite un capitaine
//   captainPrice: 350,    // Prix du capitaine
//   selectedOptions: [
//     { label: "Option A", unitPrice: 50, quantity: 2, payableAtBoard: true },
//     { label: "Option B", unitPrice: 30, quantity: 1, payableAtBoard: false }
//   ]
// });
// Résultat attendu :
// - payableOnBoard = 350 (capitaine) + 100 (option A) = 450€
// - totalAmount = 1000 (bateau) + 30 (option B online) + 450 (payable à bord) = 1480€

// const exemple2 = calculateBookingTotal({
//   basePrice: 1000,      // Prix du bateau
//   withCaptain: true,    // Client a son propre capitaine
//   captainPrice: 350,    // Prix du capitaine (non facturé)
//   selectedOptions: [
//     { label: "Option A", unitPrice: 50, quantity: 2, payableAtBoard: true },
//     { label: "Option B", unitPrice: 30, quantity: 1, payableAtBoard: false }
//   ]
// });
// Résultat attendu :
// - payableOnBoard = 0 (pas de capitaine) + 100 (option A) = 100€
// - totalAmount = 1000 (bateau) + 30 (option B online) + 100 (payable à bord) = 1130€

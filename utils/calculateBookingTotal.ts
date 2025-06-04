type CalculateTotalArgs = {
  basePrice: number;
  withCaptain: boolean;
  captainPrice: number;
  selectedOptions: {
    unitPrice: number;
    quantity: number;
  }[];
};

export function calculateBookingTotal({
  basePrice,
  withCaptain,
  captainPrice,
  selectedOptions,
}: CalculateTotalArgs): {
  totalAmount: number;
  payableOnBoard: number;
} {
  const optionsTotal = selectedOptions.reduce(
    (sum, opt) => sum + opt.unitPrice * opt.quantity,
    0
  );

  const captainCost = withCaptain ? 0 : captainPrice;

  const total = basePrice + captainCost + optionsTotal;

  return {
    totalAmount: total,
    payableOnBoard: total, // Tout payable à bord dans ton système actuel
  };
}

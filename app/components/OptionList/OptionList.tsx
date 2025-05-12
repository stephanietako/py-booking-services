// app/my-bookings/OptionList.tsx
"use client";

import { BookingOption } from "@/types";
import styles from "./styles.module.scss";

export default function OptionList({ options }: { options: BookingOption[] }) {
  if (!options.length) return <p>Aucune option sélectionnée.</p>;
  return (
    <ul className={styles.optionList}>
      {options.map((opt) => (
        <li key={opt.optionId}>
          <strong>{opt.label}</strong> – x{opt.quantity} @ {opt.unitPrice}€
        </li>
      ))}
    </ul>
  );
}

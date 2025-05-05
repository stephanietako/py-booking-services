"use client";

import { useState } from "react";
import styles from "./styles.module.scss";

interface OptionQuantityUpdaterProps {
  initialQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

const OptionQuantityUpdater: React.FC<OptionQuantityUpdaterProps> = ({
  initialQuantity,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value, 10);
    if (isNaN(newQty) || newQty < 0) return;

    setQuantity(newQty);
    setLoading(true);
    setMessage(null);

    try {
      onQuantityChange(newQty); // ⬅️ tu envoies directement la quantité

      setMessage(`✅ Quantité mise à jour.`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Quantité</label>
      <input
        type="number"
        min="0"
        value={quantity}
        onChange={handleChange}
        disabled={loading}
        className={styles.input}
      />
      {loading && <p className={styles.loading}>Mise à jour...</p>}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default OptionQuantityUpdater;

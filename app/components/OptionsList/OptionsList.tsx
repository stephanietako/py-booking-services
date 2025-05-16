"use client";

import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";

export interface Option {
  id: string;
  name: string;
  label?: string;
  description?: string;
  unitPrice: number;
}

export interface SelectedOption {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface OptionsListProps {
  options: Option[];
  onChange: (selected: SelectedOption[], total: number) => void;
}

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const MAX_QUANTITY = 99;

const OptionsList: React.FC<OptionsListProps> = ({ options, onChange }) => {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedOptions: SelectedOption[] = [];
    let total = 0;

    for (const id in selected) {
      const qty = selected[id];
      if (qty > 0) {
        const opt = options.find((o) => o.id === id);
        if (opt) {
          selectedOptions.push({
            id: opt.id,
            name: opt.name,
            quantity: qty,
            unitPrice: opt.unitPrice,
          });
          total += qty * opt.unitPrice;
        }
      }
    }

    onChange(selectedOptions, total);
  }, [selected, options, onChange]);

  const toggleOption = (id: string, checked: boolean) => {
    setError(null);

    if (!checked) {
      setPendingDelete(id);
      return;
    }

    setSelected((prev) => {
      const copy = { ...prev };
      if (!copy[id]) copy[id] = 1;
      return copy;
    });
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      setSelected((prev) => {
        const copy = { ...prev };
        delete copy[pendingDelete];
        return copy;
      });
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => setPendingDelete(null);

  const changeQuantity = (id: string, value: string) => {
    setError(null);
    if (value === "") {
      setSelected((prev) => ({ ...prev, [id]: 0 }));
      return;
    }

    const qty = Number(value);
    if (isNaN(qty) || qty < 1) {
      setError("La quantité doit être un entier supérieur ou égal à 1.");
      return;
    }
    if (qty > MAX_QUANTITY) {
      setError(`La quantité maximale est de ${MAX_QUANTITY}.`);
      return;
    }

    setSelected((prev) => ({ ...prev, [id]: qty }));
  };

  return (
    <>
      <div className={styles.optionsList}>
        <h3>Options supplémentaires</h3>
        {options.length === 0 && <p>Aucune option disponible.</p>}
        {error && <p className={styles.error}>{error}</p>}

        {loading && <p>Chargement en cours...</p>}

        {options.map((opt) => {
          const isChecked = selected.hasOwnProperty(opt.id);
          const qty = selected[opt.id] ?? 1;

          return (
            <div key={opt.id} className={styles.optionItem}>
              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => toggleOption(opt.id, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.optionName}>
                  {opt.label || opt.name}
                </span>
                <span className={styles.optionPrice}>
                  {opt.unitPrice === 0
                    ? "Offert"
                    : currencyFormatter.format(opt.unitPrice)}
                </span>
              </label>

              {isChecked && (
                <input
                  type="number"
                  min={1}
                  max={MAX_QUANTITY}
                  value={qty === 0 ? "" : qty}
                  onChange={(e) => changeQuantity(opt.id, e.target.value)}
                  className={styles.qtyInput}
                  aria-label={`Quantité pour ${opt.name}`}
                  disabled={loading}
                />
              )}
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <div className={styles.modal}>
          <p>Confirmer la suppression de cette option ?</p>
          <button onClick={confirmDelete} disabled={loading}>
            Oui
          </button>
          <button onClick={cancelDelete} disabled={loading}>
            Non
          </button>
        </div>
      )}
    </>
  );
};

export default OptionsList;

"use client";

import React, { useEffect, useState } from "react";
import {
  addTransactionToBooking,
  deleteTransaction,
  getTransactionsByBookingId,
  updateBookingTotal, // ✅ Nouvelle action
} from "@/actions/bookings";
import { Transaction } from "@/types";
import { FaRegTrashAlt, FaWallet } from "react-icons/fa";
import { BsCartX } from "react-icons/bs";

interface TransactionManagerProps {
  bookingId: string;
  serviceAmount: number; // ✅ Ajout du prix initial du service
  onTotalUpdate?: (total: number) => void; // ✅ Callback pour envoyer le total
}

const TransactionManager: React.FC<TransactionManagerProps> = ({
  bookingId,
  serviceAmount, // ✅ Montant initial
  onTotalUpdate,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(serviceAmount || 0);

  const options = [
    { description: "Personne supplémentaire", amount: 50 },
    { description: "Personne supplémentaire", amount: 120 },
    { description: "Hôtesse", amount: 200 },
    { description: "Vidéo drone", amount: 500 },
    { description: "Paddle board", amount: 50 },
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { transactions } = await getTransactionsByBookingId(bookingId);
      setTransactions(transactions);

      // ✅ Vérifie que les transactions sont bien des nombres valides avant de calculer
      const total = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        serviceAmount || 0
      );

      setTotalAmount(total); // ✅ Met à jour localement
      onTotalUpdate?.(total); // ✅ Envoie le total à la card
      console.log("Montant du service:", serviceAmount);
      console.log("Transactions récupérées:", transactions);
      console.log("Total calculé :", total);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des transactions :", error);
      setError("Impossible de récupérer les transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, serviceAmount]);

  const handleAddTransaction = async () => {
    if (!selectedOption) {
      alert("Veuillez sélectionner une option valide");
      return;
    }

    const option = options.find(
      (opt) => opt.amount.toString() === selectedOption
    );
    if (!option) {
      alert("Option invalide");
      return;
    }

    try {
      await addTransactionToBooking(
        bookingId,
        option.amount,
        option.description
      );
      await updateBookingTotal(bookingId); // ✅ Mise à jour du total dans la DB
      setSelectedOption("");
      setTotalAmount((prev) => prev + option.amount); // ✅ Mise à jour locale du total
      fetchTransactions(); // ✅ Recharge les transactions
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de la transaction :", error);
      alert("Une erreur s'est produite lors de l'ajout.");
    }
  };

  // 🔥 Suppression d'une transaction et mise à jour du total
  const handleDeleteTransaction = async (
    transactionId: string,
    amount: number
  ) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette transaction ?"
    );
    if (!confirmed) return;

    try {
      await deleteTransaction(transactionId);
      await updateBookingTotal(bookingId); // ✅ Mise à jour du total après suppression
      setTotalAmount((prev) => prev - amount); // ✅ Mise à jour locale
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de la transaction :",
        error
      );
      alert("Impossible de supprimer la transaction.");
    }
  };

  return (
    <div className="manage_service_container">
      <h3>Options supplémentaires</h3>
      <div className="form">
        <div className="options">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="select_option"
          >
            <option value="" disabled>
              Choisir une option
            </option>
            {options.map((option) => (
              <option
                key={`${option.description}-${option.amount}`}
                value={option.amount.toString()}
              >
                {option.description} - {option.amount}€
              </option>
            ))}
          </select>
          <button onClick={handleAddTransaction} className="btn_option">
            Ajouter une option
          </button>
        </div>

        <h4>Total à payer : {totalAmount}€</h4>

        <h3>Transactions</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : transactions.length === 0 ? (
          <div className="no_transaction">
            <span className="no_transaction_text">
              <BsCartX />
              <p>aucune transaction</p>
            </span>
          </div>
        ) : (
          <table className="table_container">
            <thead>
              <tr>
                <th>Service</th>
                <th>Montant</th>
                <th>Description</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <FaWallet />
                  </td>
                  <td>+ {transaction.amount}€</td>
                  <td>{transaction.description}</td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleTimeString(
                      "fr-FR",
                      { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleDeleteTransaction(
                          transaction.id,
                          transaction.amount
                        )
                      }
                      className="btn_action"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionManager;

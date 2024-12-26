"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getTransactionsByEmailAndPeriod } from "@/actions/actions";
import Wrapper from "../components/Wrapper/Wrapper";
import { Transaction } from "@/type";
import TransactionItem from "../components/TransactionItem/TransactionItem";
// Retourner la liste des transactions en fonction de la periode choisie

const TransactionsPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async (period: string) => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setLoading(true);
      try {
        const transactionData = await getTransactionsByEmailAndPeriod(
          user?.primaryEmailAddress?.emailAddress,
          period
        );
        setTransactions(transactionData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des transactions:",
          error
        );
      }
    }
  };

  // par defaut last30
  useEffect(() => {
    fetchTransactions("last30");
    // eslint-disable-next-line
  }, [user?.primaryEmailAddress?.emailAddress]);

  return (
    <Wrapper>
      <div className="transactions_select">
        <select
          className="transactions_select__input"
          defaultValue="last30"
          onChange={(e) => fetchTransactions(e.target.value)}
        >
          <option value="last7">Derniers 7 jours</option>
          <option value="last30">Derniers 30 jours</option>
          <option value="last90">Derniers 90 jours</option>
          <option value="last365">Derniers 365 jours</option>
        </select>
      </div>
      <div className="transactions_container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="loading_info">
            <span>Aucune transaction à afficher</span>
          </div>
        ) : (
          <ul className="list_transactions">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              ></TransactionItem>
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default TransactionsPage;

import React from "react";
import { Transaction } from "@/types";
import Link from "next/link";
import styles from "./styles.module.scss";

type TransactionItemProps = {
  transaction: Transaction;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const transactionDate = new Date(transaction.createdAt); // ✅ Conversion de la date
  console.log("Transaction affichée:", transaction);
  return (
    <li className={styles.transaction_item}>
      <div className={styles.transaction_item__details}>
        <span className={styles.transaction_item__amount}>
          {transaction.amount}€
        </span>
        <span className={styles.transaction_item__description}>
          {transaction.description}
        </span>
        <span className={styles.transaction_item__date}>
          {transactionDate.toLocaleDateString("fr-FR")} à{" "}
          {transactionDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className={styles.transaction_item__see_more}>
        <Link
          className={styles.btn__see_more}
          href={`/manage/${transaction.serviceId}`}
          aria-label={`Voir plus de détails sur le service ${transaction.serviceId}`}
        >
          Voir plus
        </Link>
      </div>
    </li>
  );
};

export default TransactionItem;

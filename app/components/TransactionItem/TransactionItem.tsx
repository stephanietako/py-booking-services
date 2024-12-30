import { Transaction } from "@/type";
import React from "react";
import Link from "next/link";
// Styles
import styles from "./styles.module.scss";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  return (
    <li key={transaction.id} className={styles.transaction_item_list}>
      <div className={styles.transaction_item_list__bloc}>
        <button className={styles.btn_transaction_item}>
          <div className={styles.transaction_item__badge}>
            + {transaction.amount}€
          </div>
          {transaction.serviceName}
        </button>
      </div>
      <div className={styles.transaction_item__infos}>
        <div className={styles.transaction_item__infos_bloc}>
          <span className={styles.transaction_item__description}>
            {transaction.description}
          </span>
          <span className={styles.transaction_item__date_time}>
            {transaction.createdAt.toLocaleDateString("fr-FR")} à{" "}
            {transaction.createdAt.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className={styles.transaction_item__see_more}>
        <Link
          className={styles.btn__see_more}
          href={`/manage/${transaction.serviceId}`}
        >
          voir plus
        </Link>
      </div>
    </li>
  );
};

export default TransactionItem;

import { Service } from "@/type";
import React from "react";
import styles from "./styles.module.scss";

interface ServiceItemProps {
  service: Service;
  enableHover?: number;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, enableHover }) => {
  const transactionCount = service.transactions
    ? service.transactions.length
    : 0;
  const totalTransactionAmount = service.transactions
    ? service.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      )
    : 0;

  const remainingAmount = service.amount - totalTransactionAmount;

  const progressValue =
    totalTransactionAmount > service.amount
      ? 100
      : (totalTransactionAmount / service.amount) * 100;

  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";

  return (
    <li className={`${styles.serviceItem} ${hoverClass}`}>
      <div className={styles.serviceItemHeader}>
        <div className={styles.serviceItemDetails}>
          <div className={styles.serviceItemInfo}>
            <span className={styles.serviceItemTitle}>{service.name}</span>
            <span className={styles.serviceItemTransactionCount}>
              {transactionCount} transaction(s)
            </span>
          </div>
        </div>
        <div className={styles.serviceItemAmount}>{service.amount} €</div>
      </div>
      <div className={styles.serviceItemStats}>
        <span>{totalTransactionAmount} € dépensés</span>
        <span>{remainingAmount} € restants</span>
      </div>
      <div className={styles.serviceItemProgress}>
        <progress value={progressValue} max="100"></progress>
      </div>
    </li>
  );
};

export default ServiceItem;

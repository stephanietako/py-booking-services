import React from "react";
import { Option } from "@/types";
import Link from "next/link";
import styles from "./styles.module.scss";

type OptionItemProps = {
  option: Option;
};

const OptionItem: React.FC<OptionItemProps> = ({ option }) => {
  const optionDate = new Date(option.createdAt); // ✅ Conversion de la date
  console.log("Option affichée:", option);
  return (
    <li className={styles.transaction_item}>
      <div className={styles.transaction_item__details}>
        <span className={styles.transaction_item__amount}>
          {option.amount}€
        </span>
        <span className={styles.transaction_item__description}>
          {option.description}
        </span>
        <span className={styles.transaction_item__date}>
          {optionDate.toLocaleDateString("fr-FR")} à{" "}
          {optionDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className={styles.transaction_item__see_more}>
        <Link
          className={styles.btn__see_more}
          href={`/manage/${option.serviceId}`}
          aria-label={`Voir plus de détails sur le service ${option.serviceId}`}
        >
          Voir plus
        </Link>
      </div>
    </li>
  );
};

export default OptionItem;

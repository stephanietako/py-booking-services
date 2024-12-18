// Importation de la définition de type 'Service' depuis un fichier type
import { Service } from "@/type";
import React from "react";
// Styles
import styles from "./styles.module.scss";

// Déclaration de l'interface des propriétés pour le composant ServiceItem
interface ServiceItemProps {
  service: Service; // Un objet 'service' de type 'Service'
  enableHover?: number; // Une propriété optionnelle pour activer le survol
}

// Déclaration du composant fonctionnel ServiceItem avec les propriétés définies par ServiceItemProps
const ServiceItem: React.FC<ServiceItemProps> = ({ service, enableHover }) => {
  // Calcul du nombre de transactions, s'il y en a
  const transactionCount = service.transactions
    ? service.transactions.length
    : 0;

  // Calcul du montant total des transactions, s'il y en a
  const totalTransactionAmount = service.transactions
    ? service.transactions.reduce(
        (sum, transaction) => sum + transaction.amount, // Additionne les montants des transactions
        0 // Valeur initiale de la somme
      )
    : 0;

  // Calcul du montant restant (montant total du service moins le total des transactions)
  const remainingAmount = service.amount - totalTransactionAmount;

  // Calcul de la valeur de progression en pourcentage
  const progressValue =
    totalTransactionAmount > service.amount
      ? 100 // Si le total des transactions dépasse le montant du service, mettre à 100%
      : (totalTransactionAmount / service.amount) * 100; // Sinon, calculer le pourcentage

  // Définir la classe CSS pour le survol si 'enableHover' est égal à 1
  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";

  // Retourne l'élément de liste représentant un service
  return (
    <li className={`${styles.serviceItem} ${hoverClass}`}>
      {/* En-tête de l'élément de service */}
      <div className={styles.serviceItemHeader}>
        <div className={styles.serviceItemDetails}>
          <div className={styles.serviceItemInfo}>
            {/* Affichage du nom du service */}
            <span className={styles.serviceItemTitle}>{service.name}</span>
            {/* Affichage du nombre de transactions */}
            <span className={styles.serviceItemTransactionCount}>
              {transactionCount} transaction(s)
            </span>
          </div>
        </div>
        {/* Affichage du montant total du service */}
        <div className={styles.serviceItemAmount}>{service.amount} €</div>
      </div>
      {/* Statistiques du service */}
      <div className={styles.serviceItemStats}>
        <span>{totalTransactionAmount} € dépensés</span>
        <span>{remainingAmount} € restants</span>
      </div>
      {/* Barre de progression représentant l'avancement */}
      <div className={styles.serviceItemProgress}>
        <progress value={progressValue} max="100"></progress>
      </div>
    </li>
  );
};

export default ServiceItem;

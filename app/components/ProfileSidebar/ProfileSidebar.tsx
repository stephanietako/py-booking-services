"use client";

import React from "react";
// Styles
import styles from "./styles.module.scss";

interface Props {
  userName: string;
  userPhone: string;
  userDescription: string;
}

export default function ProfileSidebar({
  userName,
  userPhone,
  userDescription,
}: Props) {
  const completedFields = [
    Boolean(userName),
    Boolean(userPhone),
    Boolean(userDescription),
  ];
  const completionRate = Math.round(
    (completedFields.filter(Boolean).length / completedFields.length) * 100
  );

  return (
    <div className={styles.contextSide}>
      <h3>Gérez votre profile</h3>
      <p>
        Cette page vous permet de gérer vos informations personnelles. Pensez à
        les tenir à jour afin de garantir une expérience optimale.
      </p>

      <div className={styles.progress}>
        <p>
          Complétion du profil : <strong>{completionRate}%</strong>
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className={styles.checklist}>
        <h3>Champs complétés :</h3>
        <ul>
          <li className={userName ? styles.done : ""}>
            {userName ? "✅" : "⬜"} Nom renseigné
          </li>
          <li className={userPhone ? styles.done : ""}>
            {userPhone ? "✅" : "⬜"} Téléphone ajouté
          </li>
          <li className={userDescription ? styles.done : ""}>
            {userDescription ? "✅" : "⬜"} Description écrite
          </li>
        </ul>
      </div>

      <div className={styles.metaInfo}>
        <p>
          Dernière mise à jour :{" "}
          <strong>{new Date().toLocaleDateString("fr-FR")}</strong>
        </p>
      </div>
    </div>
  );
}

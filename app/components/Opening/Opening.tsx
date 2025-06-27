"use client";

import { FC, useState } from "react";
import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
import Wrapper from "@/app/components/Wrapper/Wrapper";
// Styles
import styles from "./styles.module.scss";

const Opening: FC = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Wrapper>
      <section>
        <div className={styles.opening__container}>
          <div className={styles.admin_container}>
            <h1>Administration : Horaires et Jours Fermés</h1>
            <p>
              Gérez les horaires d&apos;ouverture de votre établissement et les
              jours où il est fermé. Vous pouvez choisir de gérer les horaires
              ou les jours fermés en utilisant les boutons ci-dessous.
            </p>
            <div className={styles.switch_container}>
              <button
                className={`${styles.switch_btn} ${!enabled ? styles.active : ""}`}
                onClick={() => setEnabled(false)}
              >
                Gérer les horaires
              </button>
              <button
                className={`${styles.switch_btn} ${enabled ? styles.active : ""}`}
                onClick={() => setEnabled(true)}
              >
                Gérer les jours fermés
              </button>
            </div>

            {!enabled ? <ManageOpeningHours /> : <ClosedDays />}
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default Opening;

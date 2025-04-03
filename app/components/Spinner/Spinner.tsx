import type { FC } from "react";
import Image from "next/image"; // Import du composant Image de Next.js
import styles from "./styles.module.scss"; // Import des styles

const Spinner: FC = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.content}>
        <Image
          src="/assets/logo/hippo.png"
          alt="Logo"
          width={150}
          height={180}
          className={styles.logo}
          priority
        />
        <svg
          className={styles.spinner}
          width="65px"
          height="65px"
          viewBox="0 0 66 66"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className={styles.path}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            cx="33"
            cy="33"
            r="30"
          ></circle>
        </svg>
        <p className={styles.text}>Chargement en cours...</p>
      </div>
    </div>
  );
};

export default Spinner;

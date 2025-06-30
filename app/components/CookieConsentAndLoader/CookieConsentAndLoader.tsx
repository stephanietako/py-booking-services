"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

const LOCAL_STORAGE_KEY = "cookie-consent";

export default function CookieConsentAndLoader() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | "unset">(
    "unset"
  );

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as
      | "accepted"
      | "rejected"
      | null;
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
  }, []);

  useEffect(() => {
    if (consent === "accepted") {
      // Exemple : chargement conditionnel Stripe
      import("@stripe/stripe-js").then(({ loadStripe }) => {
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
      });
    }
  }, [consent]);

  const handleConsent = (value: "accepted" | "rejected") => {
    setConsent(value);
    localStorage.setItem(LOCAL_STORAGE_KEY, value);
    document.cookie = `cookie-consent=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  if (consent !== "unset") return null;

  return (
    <div className={styles.banner}>
      <p className={styles.message} aria-live="polite">
        Ce site utilise des cookies pour améliorer votre expérience.{" "}
        <a
          href="/cookies"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4da6ff", textDecoration: "underline" }}
        >
          En savoir plus
        </a>
        . Vous pouvez accepter ou refuser.
      </p>

      <div className={styles.actions}>
        <button
          className={styles.reject}
          onClick={() => handleConsent("rejected")}
        >
          Refuser
        </button>
        <button
          className={styles.accept}
          onClick={() => handleConsent("accepted")}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}

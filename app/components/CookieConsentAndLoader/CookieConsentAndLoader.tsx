// app/components/CookieConsentAndLoader/CookieConsentAndLoader.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

const LOCAL_STORAGE_KEY = "cookie-consent";
const COOKIE_NAME = "cookie-consent";

type ConsentStatus = "accepted" | "rejected" | "unset";

export default function CookieConsentAndLoader() {
  const [consent, setConsent] = useState<ConsentStatus>("unset");
  const [isLoading, setIsLoading] = useState(true);

  const getStoredConsent = (): ConsentStatus => {
    try {
      const stored = localStorage.getItem(
        LOCAL_STORAGE_KEY
      ) as ConsentStatus | null;
      if (stored === "accepted" || stored === "rejected") return stored;

      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))
        ?.split("=")[1] as ConsentStatus | undefined;

      if (cookieValue === "accepted" || cookieValue === "rejected")
        return cookieValue;
    } catch (error) {
      console.warn("Erreur lors de la lecture du consentement:", error);
    }
    return "unset";
  };

  useEffect(() => {
    const storedConsent = getStoredConsent();
    setConsent(storedConsent);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (consent === "accepted") {
      loadThirdPartyServices();
    } else if (consent === "rejected") {
      cleanupThirdPartyCookies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent]);

  const loadThirdPartyServices = async () => {
    try {
      const { loadStripe } = await import("@stripe/stripe-js");
      await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

      await waitForGtag();
      window.gtag("consent", "update", { analytics_storage: "granted" });
    } catch (error) {
      console.error("Erreur lors du chargement des services tiers:", error);
    }
  };

  const waitForGtag = () =>
    new Promise<void>((resolve) => {
      const check = () => {
        if (
          typeof window !== "undefined" &&
          typeof window.gtag === "function"
        ) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

  const cleanupThirdPartyCookies = () => {
    const cookiesToDelete = ["_stripe_sid", "_stripe_mid", "_ga", "_gid"];
    cookiesToDelete.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  };

  const handleConsent = (value: "accepted" | "rejected") => {
    try {
      setConsent(value);
      localStorage.setItem(LOCAL_STORAGE_KEY, value);
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      const secureAttr =
        window.location.protocol === "https:" ? " Secure;" : "";
      document.cookie = `${COOKIE_NAME}=${value}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax;${secureAttr}`;

      window.dispatchEvent(
        new CustomEvent("cookieConsentChanged", { detail: { consent: value } })
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du consentement:", error);
    }
  };

  if (isLoading || consent !== "unset") return null;

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className={styles.content}>
        <h3 id="cookie-title" className={styles.title}>
          🍪 Gestion des cookies
        </h3>
        <p id="cookie-description" className={styles.message}>
          Ce site utilise des cookies pour améliorer votre expérience et
          analyser notre trafic. Les cookies techniques sont nécessaires au
          fonctionnement du site.
          <a
            href="/politique-cookies"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            En savoir plus sur notre politique de cookies
          </a>
        </p>
        <div className={styles.actions}>
          <button
            className={styles.reject}
            onClick={() => handleConsent("rejected")}
            aria-label="Refuser les cookies non essentiels"
          >
            Refuser
          </button>
          <button
            className={styles.accept}
            onClick={() => handleConsent("accepted")}
            aria-label="Accepter tous les cookies"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

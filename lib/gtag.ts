// lib/gtag.ts
// export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// // Déclaration des types pour gtag
// declare global {
//   interface Window {
//     gtag: (...args: unknown[]) => void;
//     dataLayer: unknown[];
//   }
// }

// // Fonction pour envoyer des commandes à GA
// export const gtag = (...args: unknown[]): void => {
//   if (typeof window !== "undefined" && window.gtag) {
//     window.gtag(...args);
//   }
// };

// // Fonction pour tracker les pages vues
// export const pageview = (url: string): void => {
//   gtag("config", GA_TRACKING_ID, {
//     page_path: url,
//   });
// };

// // Interface pour les événements personnalisés
// interface AnalyticsEvent {
//   action: string;
//   category: string;
//   label?: string;
//   value?: number;
// }

// // Fonction pour tracker des événements personnalisés
// export const event = ({
//   action,
//   category,
//   label,
//   value,
// }: AnalyticsEvent): void => {
//   gtag("event", action, {
//     event_category: category,
//     event_label: label,
//     value: value,
//   });
// };

// // Version alternative plus stricte pour gtag (optionnelle)
// type GtagCommand = "config" | "event" | "js" | "set";

// interface GtagConfigParams {
//   page_path?: string;
//   [key: string]: unknown;
// }

// interface GtagEventParams {
//   event_category?: string;
//   event_label?: string;
//   value?: number;
//   [key: string]: unknown;
// }

// export const gtagStrict = (
//   command: GtagCommand,
//   targetId: string | Date,
//   params?: GtagConfigParams | GtagEventParams
// ): void => {
//   if (typeof window !== "undefined" && window.gtag) {
//     if (params) {
//       window.gtag(command, targetId, params);
//     } else {
//       window.gtag(command, targetId);
//     }
//   }
// };

// // Fonction pageview avec le gtag strict
// export const pageviewStrict = (url: string): void => {
//   gtagStrict("config", GA_TRACKING_ID, {
//     page_path: url,
//   });
// };
// lib/gtag.ts

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

// TypeScript: déclare les types globaux pour window.gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
// À mettre tout en haut du fichier lib/gtag.ts
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);
  window.gtag("consent", "default", {
    analytics_storage: "denied",
  });
}

// Fonction utilitaire pour envoyer des commandes à GA
export const gtag = (...args: unknown[]): void => {
  if (!GA_TRACKING_ID) return;
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
};

// Fonction pour traquer les pages vues
export const pageview = (url: string): void => {
  if (!GA_TRACKING_ID) return;
  gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Interface pour les événements personnalisés
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Fonction pour traquer les événements personnalisés
export const event = ({
  action,
  category,
  label,
  value,
}: AnalyticsEvent): void => {
  if (!GA_TRACKING_ID) return;
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

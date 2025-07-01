import type { Metadata } from "next";
import { Roboto, Montserrat, Gloria_Hallelujah } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import "./globals.css";
import Footer from "./components/Footer/Footer";
import CookieConsentAndLoader from "./components/CookieConsentAndLoader/CookieConsentAndLoader";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/gtag";

const roboto = Roboto({
  variable: "--roboto",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "700"],
  display: "swap",
});

const gloria = Gloria_Hallelujah({
  variable: "--gloria_hallelujah",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yachting Day Cavalaire-sur-Mer",
  description:
    "Profitez de la location de notre bateau Cap Camarat 12.5 WA (modèle 2021) avec skipper depuis le port de Cavalaire-sur-Mer. Ce bateau spacieux, moderne et parfaitement équipé vous offre un confort haut de gamme pour vos excursions en mer. Nous proposons également un service d’entretien nautique personnalisé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          {/* Google Analytics */}
          {GA_TRACKING_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', {
          page_path: window.location.pathname,
        });
      `}
              </Script>
            </>
          )}
        </head>
        <body
          className={`${roboto.variable} ${montserrat.variable} ${gloria.variable}`}
        >
          <Toaster position="top-center" />
          {children}
          <CookieConsentAndLoader />

          <div className="scroll">
            <ScrollToTop />
          </div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

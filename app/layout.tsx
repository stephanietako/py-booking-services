import type { Metadata } from "next";
import { Roboto, Montserrat, Gloria_Hallelujah } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import "./globals.css";
import Footer from "./components/Footer/Footer";

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
  title: "Yatching Day",
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
        <body
          className={`${roboto.variable} ${montserrat.variable} ${gloria.variable}`}
        >
          <Toaster position="top-center" />
          {children}
          <div className="scroll">
            <ScrollToTop />
          </div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

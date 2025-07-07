// app/reservation/test-service/page.tsx
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Metadata } from "next";
import Link from "next/link";
import TestReservationForm from "@/app/components/TestReservationForm/TestReservationForm";

export const metadata: Metadata = {
  title: "Test Réservation - 1€",
  description: "Page de test pour le service à 1€, sans réservation réelle.",
};

export default function TestReservationPage() {
  return (
    <Wrapper>
      <div style={{ padding: "2rem", marginTop: "10vh" }}>
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "2rem",
          }}
        >
          <strong style={{ color: "#856404", fontSize: "1.1rem" }}>
            ⚠️ Ceci est une page de TEST.
          </strong>
          <p style={{ marginTop: "0.5rem", color: "#856404" }}>
            Cette page permet uniquement de tester le système de réservation
            avec un service fictif à 1€.
            <br />
            Aucune sortie en mer, ni location réelle de bateau ne sera effectuée
            via cette page.
          </p>
        </div>

        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Test Réservation – Service fictif à 1€
        </h1>
        <p style={{ marginBottom: "2rem" }}>
          Cette page est destinée aux tests techniques (paiement, calendrier,
          disponibilité, etc.).
        </p>

        <TestReservationForm />

        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#888" }}>
          🔙{" "}
          <Link href="/" style={{ color: "#0070f3" }}>
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </Wrapper>
  );
}

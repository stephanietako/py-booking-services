// app/cookies/page.tsx
import React from "react";
import Wrapper from "../components/Wrapper/Wrapper";

const page = () => {
  return (
    <Wrapper>
      <section>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "3rem",
            flexDirection: "column",
            background: "#fff",
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            color: "#1e293b",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
            Politique des Cookies
          </h2>

          <h3>Introduction</h3>
          <p>
            Bienvenue sur notre site de location de bateaux
            www.yachting-day.com. Cette Politique des Cookies explique comment
            nous utilisons les cookies et comment vos données personnelles sont
            traitées. Elle inclut des informations spécifiques liées à notre
            utilisation de Stripe, un fournisseur de services de paiement
            sécurisé.
          </p>

          <h3>Qu’est-ce qu’un cookie ?</h3>
          <p>
            Un cookie est un fichier texte stocké sur votre appareil
            (ordinateur, tablette, smartphone) lorsque vous visitez notre site.
            Il joue un rôle essentiel dans le bon fonctionnement du site et dans
            l’amélioration de votre expérience utilisateur.
          </p>

          <h3>Données collectées via les cookies</h3>
          <p>
            Nous pouvons être amenés à collecter certaines données personnelles
            via des formulaires sécurisés pour les besoins de la location et du
            paiement en ligne, notamment :
          </p>
          <ul>
            <li>Nom, Prénom</li>
            <li>Adresse</li>
            <li>Adresse e-mail et numéro de téléphone</li>
            <li>Pièces d’identité et/ou permis de bateaux</li>
            <li>
              Informations bancaires nécessaires pour utiliser des paiements via
              Stripe
            </li>
            <li>Identifiants de connexion et préférences utilisateur</li>
            <li>
              Données de navigation (pages consultées, durée des visites,
              interactions)
            </li>
            <li>Adresse IP et informations sur l’appareil utilisé</li>
            <li>Historique des transactions et préférences de réservation</li>
          </ul>
          <p>
            Les cookies ne stockent pas directement ces informations sensibles,
            mais peuvent faciliter certaines fonctions, comme l’identification
            de votre session ou la gestion des transactions.
          </p>

          <h3>Types de cookies utilisés</h3>
          <ul>
            <li>
              <b>Cookies nécessaires</b> : garantissent le bon fonctionnement
              des paiements en ligne et des connexions sécurisées. Par exemple,
              Stripe utilise ses propres cookies pour vérifier l’intégrité des
              transactions et renforcer la sécurité.
            </li>
            <li>
              <b>Cookies analytiques</b> : collectent des données anonymes pour
              analyser l’utilisation du site et améliorer nos services.
            </li>
            <li>
              <b>Cookies fonctionnels</b> : mémorisent vos préférences comme la
              langue ou les filtres de recherches.
            </li>
            <li>
              <b>Cookies publicitaires</b> : vous présentent des offres
              pertinentes et personnalisées.
            </li>
          </ul>

          <h3>Stripe et cookies tiers</h3>
          <p>
            En utilisant Stripe pour les paiements en ligne, des cookies tiers
            peuvent être installés sur votre appareil. Ces cookies permettent :
          </p>
          <ul>
            <li>D’assurer la sécurité et la conformité des paiements</li>
            <li>De prévenir les fraudes</li>
            <li>D’améliorer l’expérience utilisateur lors des transactions</li>
          </ul>
          <p>
            Stripe respecte le RGPD et garantit une gestion sécurisée des
            données. Vous pouvez consulter leur politique de confidentialité
            directement sur leur site :{" "}
            <a
              href="https://stripe.com/fr/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://stripe.com/fr/privacy
            </a>
            .
          </p>

          <h3>Gestion des cookies</h3>
          <p>
            Vous pouvez gérer vos préférences de cookies via les paramètres de
            votre navigateur ou en utilisant notre outil de gestion des cookies
            disponible sur le site. Vous pouvez également désactiver certains
            cookies. Nous vous rappelons que le blocage de certains cookies peut
            affecter votre expérience utilisateur, notamment ceux de Stripe qui
            pourraient affecter le fonctionnement des paiements en ligne.
          </p>

          <h3>Sécurité des données</h3>
          <p>
            Nous utilisons des protocoles de sécurité avancés, comme le
            chiffrement SSL, pour protéger vos données personnelles, y compris
            les informations bancaires collectées via Stripe.
          </p>

          <h3>Vos droits</h3>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez de droits sur vos données personnelles :
          </p>
          <ul>
            <li>Droit d’accès, de rectification et de suppression</li>
            <li>Droit d’opposition et de limitation du traitement</li>
            <li>Droit au retrait du consentement à tout moment</li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter à{" "}
            <a href="mailto:yachtingday@gmail.com">yachtingday@gmail.com</a>.
          </p>

          <h3>Conservation des données</h3>
          <ul>
            <li>
              <b>Cookies de session</b> : supprimés à la fermeture du navigateur
            </li>
            <li>
              <b>Cookies persistants</b> : conservés pour une durée maximale
              d’un mois
            </li>
          </ul>

          <h3>Partage des données</h3>
          <p>
            Certaines informations collectées via les cookies peuvent être
            partagées avec nos partenaires, notamment pour des fins analytiques
            et publicitaires. Nous veillons à ce que ces échanges respectent la
            réglementation en vigueur.
          </p>

          <h3>Modifications</h3>
          <p>
            Nous nous réservons le droit de modifier cette politique à tout
            moment. Toute mise à jour sera publiée sur cette page avec la date
            de révision. La dernière mise à jour de cette politique date du 13
            avril 2025.
          </p>

          <h3>Contact</h3>
          <p>
            Pour toute question ou préoccupation relative à cette politique ou à
            l’utilisation de Stripe, vous pouvez nous contacter à :{" "}
            <a href="mailto:yachtingday@gmail.com">yachtingday@gmail.com</a>.
            Nous nous engageons à répondre à vos demandes dans les plus brefs
            délais.
          </p>

          <p style={{ marginTop: "2rem", fontWeight: 600 }}>
            En utilisant notre site, vous acceptez l’utilisation de cookies
            conformément à cette politique.
            <br />
            Merci de votre confiance et de votre compréhension.
            <br />
            Nous nous engageons à protéger vos données personnelles et à vous
            offrir une expérience utilisateur sécurisée et agréable.
          </p>
        </div>
      </section>
    </Wrapper>
  );
};

export default page;

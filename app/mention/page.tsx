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
            lineHeight: "1.8",
            fontSize: "1rem",
            color: "#333",
            fontFamily: "Arial, sans-serif",
            textAlign: "justify",
          }}
        >
          <h1
            style={{
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              color: "#111",
            }}
          >
            Mentions Légales
          </h1>

          <p style={{ marginBottom: "1rem" }}>
            <strong>Éditeur :</strong> Le site Internet{" "}
            <a href="https://www.yachting-day.com">www.yachting-day.com</a> (le
            « Site ») est édité par la société Yachting Day, entreprise
            individuelle, immatriculée au registre du commerce et des sociétés
            de Fréjus sous le n° 951 392 604.
          </p>

          <p style={{ marginBottom: "1rem" }}>
            Le siège social de Yachting Day est situé au 30 Allée Miramar, 83240
            Cavalaire-sur-Mer
            <br />
            <strong>Contact :</strong>{" "}
            <a href="mailto:yachtingday@gmail.com">yachtingday@gmail.com</a>
            <br />
            <strong>Tél. :</strong> 07 67 21 00 17
          </p>

          <p style={{ marginBottom: "1rem" }}>
            <strong>Hébergeur :</strong> OVH SAS, 2 rue Kellermann, 59100
            Roubaix, France
            <br />
            RCS Lille Métropole 424 761 419 00045
            <br />
            SAS au capital de 10 174 560 €<br />
            Téléphone : 1007 (depuis la France)
            <br />
            Site : <a href="https://www.ovh.com">www.ovh.com</a>
          </p>

          <p style={{ marginBottom: "1rem" }}>
            <strong>Données personnelles :</strong> Dans le cadre de
            l’utilisation de la Plateforme par les Utilisateurs, Yachting Day
            est amenée à collecter et traiter certaines de leurs données
            personnelles. En utilisant la Plateforme et s’inscrivant en tant
            qu’Utilisateur, ce dernier reconnait et accepte le traitement de ses
            données personnelles par Yachting Day conformément à la loi
            applicable, à la{" "}
            <a href="https://www.yachting-day.com/terms">
              Politique de Confidentialité
            </a>{" "}
            et aux{" "}
            <a href="https://www.yaching-day.com/cgu">
              Conditions Générales d’Utilisation
            </a>
            .
          </p>

          <p style={{ marginBottom: "1rem" }}>
            Conformément à la loi 78-17 du 6 janvier 1978 modifiée et au RGPD,
            l’Utilisateur dispose d’un droit d’accès, de modification, de
            rectification et de suppression des données le concernant. Pour
            exercer ce droit, il peut écrire à :{" "}
            <a href="mailto:yachtingday@gmail.com">yachtingday@gmail.com</a>.
            Une réclamation peut aussi être adressée à la CNIL.
          </p>

          <p>
            Yachting Day utilise des cookies afin d’offrir un service
            personnalisé. Voir notre page sur les cookies :{" "}
            <a href="https://www.yachting-day.com/cookies">
              Utilisation des cookies
            </a>
            .
          </p>
        </div>
      </section>
    </Wrapper>
  );
};

export default page;

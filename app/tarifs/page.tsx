import React from "react";
import { getClosedDays, getDays } from "@/actions/openingActions"; // Les actions que tu utilises pour récupérer les données
import Wrapper from "../components/Wrapper/Wrapper";
import Header from "../components/Header/Header";
import Boat from "../components/Boat/Boat";

const tarifs = async () => {
  const days = await getDays(); // Récupérer les jours d'ouverture
  const closedDays = await getClosedDays(); // Récupérer les jours fermés
  // Liste d'images pour le carrousel
  return (
    <Wrapper>
      <section>
        <Header days={days} closedDays={closedDays} />
        <Boat />
      </section>
    </Wrapper>
  );
};

export default tarifs;

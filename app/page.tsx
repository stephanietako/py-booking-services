"use client";

import Wrapper from "./components/Wrapper/Wrapper";
import Hero from "./components/Hero/Hero";
import Location from "./components/Location/Location";
import Head from "next/head";
import { getOpeningAndClosedDays } from "@/actions/openingActions";
import { DayInput } from "@/types";
import { useState, useEffect } from "react";
import Spinner from "./components/Spinner/Spinner";

interface OpeningAndClosedDays {
  days: DayInput[];
  closedDays: string[];
}

const Home = () => {
  const [openingAndClosedDays, setOpeningAndClosedDays] =
    useState<OpeningAndClosedDays | null>(null);
  const [loadingDays, setLoadingDays] = useState(true);
  const [errorDays, setErrorDays] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpeningAndClosedDays = async () => {
      try {
        const data = await getOpeningAndClosedDays();
        setOpeningAndClosedDays(data);
        setLoadingDays(false);
      } catch (error) {
        setErrorDays(
          (error as Error).message ||
            "Erreur lors de la récupération des jours et horaires."
        );
        setLoadingDays(false);
      }
    };

    fetchOpeningAndClosedDays();
  }, []);

  if (loadingDays) {
    return (
      <Wrapper>
        <main>
          <Hero />
          <Spinner />
        </main>
      </Wrapper>
    );
  }

  if (errorDays) {
    return (
      <Wrapper>
        <main>
          <Hero />
          <p className="error">{errorDays}</p>
        </main>
      </Wrapper>
    );
  }

  return (
    <>
      <Head>
        {/* Balises Open Graph */}
        <meta
          property="og:title"
          content="Location de bateau à Cavalaire-sur-Mer – Cap Camarat 12.5 WA avec skipper"
        />
        <meta
          property="og:description"
          content="Profitez d'une excursion privée en mer à bord d'un Cap Camarat 12.5 WA de 2021, avec skipper au départ de Cavalaire-sur-Mer. Bateau spacieux, récent et tout équipé pour un confort exceptionnel."
        />
        <meta
          property="og:image"
          content="https://yachting-day.com/assets/images/hero.webp"
        />
        <meta property="og:url" content="https://yachting-day.com" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
      </Head>
      <Wrapper>
        <main>
          <Hero />
          {openingAndClosedDays && (
            <Location
              days={openingAndClosedDays.days}
              closedDays={openingAndClosedDays.closedDays}
            />
          )}
        </main>
      </Wrapper>
    </>
  );
};

export default Home;

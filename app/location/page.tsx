"use client";

import React, { useState, useEffect } from "react";
import Location from "../components/Location/Location";
import { DayInput } from "@/types";
import { getOpeningAndClosedDays } from "@/actions/openingActions";

interface OpeningAndClosedDays {
  days: DayInput[];
  closedDays: string[];
}

const LocationPage = () => {
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
        // Le type 'unknown' est implicite ici
        setErrorDays(
          (error as Error)?.message || // Essayez d'accéder à la propriété 'message' si c'est une Error
            "Erreur lors de la récupération des jours et horaires."
        );
        setLoadingDays(false);
      }
    };

    fetchOpeningAndClosedDays();
  }, []);

  if (loadingDays) {
    return <p>Chargement des horaires et jours fermés...</p>;
  }

  if (errorDays) {
    return <p className="error">{errorDays}</p>;
  }

  if (openingAndClosedDays) {
    return (
      <div>
        <Location
          days={openingAndClosedDays.days}
          closedDays={openingAndClosedDays.closedDays}
        />
      </div>
    );
  }

  return null;
};

export default LocationPage;

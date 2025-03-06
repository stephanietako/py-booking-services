"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getOptionsByEmailAndPeriod } from "@/actions/actions";
import Wrapper from "../components/Wrapper/Wrapper";
import { Option } from "@/types";
import OptionItem from "../components/OptionItem/OptionItem";

const OptionsPage = () => {
  const { user } = useUser();
  const [option, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>("last30");
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async (period: string) => {
    if (user?.id) {
      setLoading(true);
      try {
        const optionData = await getOptionsByEmailAndPeriod(user.id, period);
        console.log("Données reçues dans le client:", optionData);
        setOptions(optionData);
      } catch (err) {
        console.error("Erreur lors de la récupération des options: ", err);
        setError("Impossible de récupérer les options.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOptions("last30");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Wrapper>
      <div className="transactions_select">
        <select
          className="transactions_select__input"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="last7">Derniers 7 jours</option>
          <option value="last30">Derniers 30 jours</option>
          <option value="last90">Derniers 90 jours</option>
          <option value="last365">Derniers 365 jours</option>
        </select>
      </div>

      <div className="transactions_container">
        {loading ? (
          <div className="flex justify-center items-center">
            <span className="loading ">LOADING...</span>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : option.length === 0 ? (
          <div className="loading_info">
            <span>Aucune option à afficher</span>
          </div>
        ) : (
          <ul className="list_transactions">
            {option.map((option) => (
              <OptionItem key={option.id} option={option} />
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default OptionsPage;

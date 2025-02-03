"use client";

import { FC, useState } from "react";
import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
import Wrapper from "@/app/components/Wrapper/Wrapper";

const Opening: FC = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Wrapper>
      <div className="admin-container">
        <h2>Administration : Horaires et Jours Fermés</h2>
        <div className="switch-container">
          <button
            className={`switch-btn ${!enabled ? "active" : ""}`}
            onClick={() => setEnabled(false)}
          >
            Gérer les horaires
          </button>
          <button
            className={`switch-btn ${enabled ? "active" : ""}`}
            onClick={() => setEnabled(true)}
          >
            Gérer les jours fermés
          </button>
        </div>

        {!enabled ? <ManageOpeningHours /> : <ClosedDays />}
      </div>
    </Wrapper>
  );
};

export default Opening;

"use client";
import { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

const CalendarsPage = () => {
  const [minDate, setMinDate] = useState<Date | null>(null);

  useEffect(() => {
    setMinDate(new Date());
  }, []);

  if (minDate === null) {
    return <div>Loading...</div>; // Ou un spinner de chargement
  }

  return (
    <div>
      <div>
        <Calendar />
      </div>
    </div>
  );
};

export default CalendarsPage;

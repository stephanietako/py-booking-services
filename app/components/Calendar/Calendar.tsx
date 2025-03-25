"use client";

import React, { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore } from "date-fns";
import type { Day } from "@prisma/client";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

const DynamicCalendar = React.memo(
  dynamic(() => import("react-calendar"), { ssr: false })
);

interface CalendarProps {
  days: Day[];
  closedDays: string[];
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter();

  // ⏳ Stocker la date, heure de début et heure de fin sélectionnées
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [bookedTimes, setBookedTimes] = useState<{ start: Date; end: Date }[]>(
    []
  );

  // 📡 Charger les créneaux réservés pour la date sélectionnée
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (date) {
        try {
          const booked = await getBookedTimes(formatISO(date));
          setBookedTimes(
            booked.map(({ startTime, endTime }) => ({
              start: new Date(startTime),
              end: new Date(endTime),
            }))
          );
        } catch (error) {
          console.error(
            "❌ Erreur lors de la récupération des créneaux :",
            error
          );
        }
      }
    };

    fetchBookedTimes();
  }, [date]);

  // 📅 Obtenir les créneaux disponibles
  const availableTimes = date ? getOpeningTimes(date, days) : [];
  const filteredTimes = filterAvailableTimes(
    availableTimes,
    bookedTimes.map((b) => b.start)
  );

  const handleSelectTime = (time: Date) => {
    if (!startTime) {
      console.log("🕐 Sélection du startTime :", time);
      setStartTime(time);
      setEndTime(null);
    } else if (!endTime) {
      if (isBefore(startTime, time)) {
        console.log("⏳ Sélection du endTime :", time);
        setEndTime(time);
      } else {
        alert("🚫 L'heure de fin doit être après l'heure de début !");
      }
    }
  };

  // 🔄 Sauvegarde `startTime` et `endTime` dans localStorage + Redirection
  useEffect(() => {
    if (startTime && endTime) {
      localStorage.setItem("selectedStartTime", startTime.toISOString());
      localStorage.setItem("selectedEndTime", endTime.toISOString());
    }
  }, [startTime, endTime]);

  return (
    <div className="calendar_container">
      {date ? (
        <div className="time">
          <h3>Choisissez vos horaires :</h3>

          {/* Affichage des créneaux disponibles */}
          {filteredTimes.length > 0 ? (
            filteredTimes.map((time, index) => (
              <div className="time_bloc" key={`time-${index}`}>
                <button
                  className={`btn_times ${startTime === time ? "selected" : ""} ${
                    endTime === time ? "selected" : ""
                  }`}
                  onClick={() => handleSelectTime(time)}
                  type="button"
                >
                  {format(time, "kk:mm")}
                </button>
              </div>
            ))
          ) : (
            <p>Aucune plage horaire disponible pour cette date.</p>
          )}

          {/* Affichage du créneau sélectionné */}
          {startTime && endTime && (
            <p>
              Réservation de {format(startTime, "kk:mm")} à{" "}
              {format(endTime, "kk:mm")}
            </p>
          )}
        </div>
      ) : (
        <DynamicCalendar
          minDate={now}
          className="REACT-CALENDAR p-2"
          view="month"
          tileDisabled={({ date }) =>
            Array.isArray(closedDays) && closedDays.includes(formatISO(date))
          }
          tileClassName={({ date }) =>
            Array.isArray(closedDays) && closedDays.includes(formatISO(date))
              ? "closed-day"
              : ""
          }
          onClickDay={(date) => {
            if (!closedDays.includes(formatISO(date))) {
              setDate(date);
              setStartTime(null);
              setEndTime(null);
            }
          }}
        />
      )}
      {/* Affichage du créneau sélectionné avec bouton de confirmation */}
      {startTime && endTime && (
        <div>
          <p>
            Réservation de {format(startTime, "kk:mm")} à{" "}
            {format(endTime, "kk:mm")}
          </p>
          <button
            className="btn_confirm"
            onClick={() => router.push("/serviceList")}
          >
            Confirmer la réservation
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;

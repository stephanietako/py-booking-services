"use client";

import React, { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore } from "date-fns";
import { DayInput } from "@/types";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
// Styles
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

const DynamicCalendar = React.memo(
  dynamic(() => import("react-calendar"), { ssr: false })
);

interface CalendarProps {
  days: DayInput[]; // Utiliser DayInput au lieu de Day
  closedDays: string[];
}

interface BookedTime {
  start: Date;
  end: Date;
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter();

  // ⏳ Stocker la date, heure de début et heure de fin sélectionnées
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]); // Type correctement défini

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
  const filteredTimes = filterAvailableTimes(availableTimes, bookedTimes);

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

  return (
    <div className="calendar_container">
      {!date ? (
        <>
          <h3>Choisissez une date:</h3>
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
        </>
      ) : (
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

          {/* Bouton de confirmation */}
          {startTime && endTime && (
            <div>
              <button
                className="btn_confirm"
                onClick={() =>
                  router.push(
                    `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
                  )
                }
              >
                Confirmer mes choix
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;

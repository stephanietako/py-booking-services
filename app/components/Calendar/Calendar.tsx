"use client";

import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore, isAfter } from "date-fns";
import { DayInput } from "@/types";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

const DynamicCalendar = React.memo(
  dynamic(() => import("react-calendar"), { ssr: false })
);

interface CalendarProps {
  days: DayInput[];
  closedDays: string[];
}

interface BookedTime {
  start: Date;
  end: Date;
}

const Calendar: FC<CalendarProps> = ({ days, closedDays }) => {
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Mémorisation des calculs coûteux
  const availableTimes = useMemo(
    () => (date ? getOpeningTimes(date, days) : []),
    [date, days]
  );

  const filteredTimes = useMemo(
    () => filterAvailableTimes(availableTimes, bookedTimes),
    [availableTimes, bookedTimes]
  );

  // Calcul de l'étape actuelle mémorisé
  const currentStep = useMemo(() => {
    if (!date) return 1;
    if (date && !startTime) return 2;
    if (startTime && !endTime) return 3;
    if (startTime && endTime) return 4;
    return 1;
  }, [date, startTime, endTime]);

  // Message d'instruction mémorisé
  const instructionMessage = useMemo(() => {
    if (!date) return "Choisissez une date :";
    if (!startTime) return "Sélectionnez l'heure de début :";
    if (!endTime) return "Sélectionnez l'heure de fin :";
    return "Confirmez votre créneau :";
  }, [date, startTime, endTime]);

  // Fonctions de vérification des tuiles mémorisées
  const tileDisabled = useCallback(
    ({ date }: { date: Date }) => closedDays.includes(formatISO(date)),
    [closedDays]
  );

  const tileClassName = useCallback(
    ({ date }: { date: Date }) =>
      closedDays.includes(formatISO(date)) ? "closed-day" : "",
    [closedDays]
  );

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!date) return setBookedTimes([]);

      setIsLoadingBookings(true);
      setBookingError(null);
      try {
        const booked = await getBookedTimes(formatISO(date));
        setBookedTimes(
          booked.map(({ startTime, endTime }) => ({
            start: new Date(startTime),
            end: new Date(endTime),
          }))
        );
      } catch (err) {
        console.error("Erreur lors du chargement des créneaux :", err);
        setBookingError("Une erreur est survenue lors du chargement.");
        setBookedTimes([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchBookedTimes();
  }, [date]);

  const handleSelectTime = useCallback(
    (time: Date) => {
      if (!startTime) {
        setStartTime(time);
        setEndTime(null);
      } else if (!endTime) {
        if (isAfter(time, startTime)) {
          setEndTime(time);
        } else {
          alert("⛔ L'heure de fin doit être après l'heure de début !");
        }
      } else {
        setStartTime(time);
        setEndTime(null);
      }
    },
    [startTime, endTime]
  );

  const isInRange = useCallback(
    (time: Date): boolean =>
      !!startTime &&
      !!endTime &&
      isAfter(time, startTime) &&
      isBefore(time, endTime),
    [startTime, endTime]
  );

  const handleReset = useCallback(() => {
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setBookedTimes([]);
    setBookingError(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (startTime && endTime) {
      router.push(
        `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
      );
    }
  }, [startTime, endTime, router]);

  const handleClickDay = useCallback(
    (selectedDate: Date) => {
      const iso = formatISO(selectedDate);
      if (!closedDays.includes(iso)) {
        setDate(selectedDate);
        setStartTime(null);
        setEndTime(null);
      }
    },
    [closedDays]
  );

  return (
    <div className="calendar_container">
      {/* Barre d'étapes */}
      <div
        className="steps_bar"
        role="list"
        aria-label="Progression des étapes"
      >
        <div
          className={`step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 1 ? "step" : undefined}
        >
          <span className="step_number">1</span> Choix de la date
        </div>
        <div
          className={`step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 2 ? "step" : undefined}
        >
          <span className="step_number">2</span> Choix heure début
        </div>
        <div
          className={`step ${currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""}`}
          role="listitem"
          aria-current={currentStep === 3 ? "step" : undefined}
        >
          <span className="step_number">3</span> Choix heure fin
        </div>
        <div
          className={`step ${currentStep === 4 ? "active" : ""}`}
          role="listitem"
          aria-current={currentStep === 4 ? "step" : undefined}
        >
          <span className="step_number">4</span> Confirmation
        </div>
      </div>

      <h3>{instructionMessage}</h3>

      {!date ? (
        <DynamicCalendar
          minDate={now}
          view="month"
          className="react-calendar p-2"
          onClickDay={handleClickDay}
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
        />
      ) : (
        <div className="time_selection_area">
          {isLoadingBookings && <p>Chargement des créneaux disponibles...</p>}
          {bookingError && <p className="error-message">{bookingError}</p>}

          {!isLoadingBookings && !bookingError && (
            <>
              {filteredTimes.length > 0 ? (
                <div className="time_grid">
                  {filteredTimes.map((time, i) => {
                    const isStart = startTime?.getTime() === time.getTime();
                    const isEnd = endTime?.getTime() === time.getTime();
                    const inRange = isInRange(time);

                    const isDisabled: boolean =
                      (startTime !== null &&
                        endTime === null &&
                        isBefore(time, startTime)) ||
                      (startTime !== null &&
                        endTime !== null &&
                        !isStart &&
                        !isEnd &&
                        !inRange);

                    return (
                      <div className="time_bloc" key={`time-${i}`}>
                        <button
                          type="button"
                          className={`btn_times
                            ${isStart ? "selected start" : ""}
                            ${isEnd ? "selected end" : ""}
                            ${inRange ? "in-range" : ""}
                            ${
                              startTime && !endTime && isAfter(time, startTime)
                                ? "available-for-end"
                                : ""
                            }`}
                          onClick={() => handleSelectTime(time)}
                          disabled={isDisabled}
                          aria-pressed={isStart || isEnd}
                          aria-label={`Heure ${format(time, "kk:mm")}`}
                        >
                          {format(time, "kk:mm")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>Aucune plage horaire disponible pour cette date.</p>
              )}
            </>
          )}

          {startTime && endTime && (
            <div className="summary">
              <h4>Votre créneau sélectionné :</h4>
              <p className="highlight">
                {format(startTime, "kk:mm")} &rarr; {format(endTime, "kk:mm")}
              </p>
            </div>
          )}

          <div className="action_buttons">
            <button
              className="btn_confirm"
              onClick={handleConfirm}
              disabled={!(startTime && endTime)}
              aria-disabled={!(startTime && endTime)}
            >
              Confirmer ma réservation
            </button>
            <button className="btn_reset" onClick={handleReset}>
              Changer de date ou réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

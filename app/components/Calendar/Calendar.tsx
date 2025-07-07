// app/components/Calendar/Calendar.tsx
"use client";

import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  format,
  formatISO,
  isBefore,
  isAfter,
  differenceInMinutes,
} from "date-fns";
import toast from "react-hot-toast";
import { DayInput } from "@/types";
import { getOpeningTimes, filterAvailableTimes } from "@/utils/helpers";
import { now } from "@/app/constants/config";
import { getBookedTimes } from "@/actions/bookings";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";
import Link from "next/link";

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

  // Mémorisation des calculs coûteux avec vérifications de sécurité
  const availableTimes = useMemo(() => {
    try {
      return date && Array.isArray(days) ? getOpeningTimes(date, days) : [];
    } catch (error) {
      console.error("Erreur lors du calcul des heures d'ouverture:", error);
      toast.error("Erreur lors du calcul des heures disponibles.");
      return [];
    }
  }, [date, days]);

  const filteredTimes = useMemo(() => {
    try {
      return Array.isArray(availableTimes) && Array.isArray(bookedTimes)
        ? filterAvailableTimes(availableTimes, bookedTimes)
        : availableTimes || [];
    } catch (error) {
      console.error("Erreur lors du filtrage des créneaux:", error);
      toast.error("Erreur lors du filtrage des créneaux.");
      return availableTimes || [];
    }
  }, [availableTimes, bookedTimes]);

  // Fonction utilitaire pour vérifier si un créneau est réservé
  const isTimeBooked = useCallback(
    (time: Date): boolean => {
      try {
        if (!time || !Array.isArray(bookedTimes)) return false;

        return bookedTimes.some(({ start, end }) => {
          if (
            !start ||
            !end ||
            !(start instanceof Date) ||
            !(end instanceof Date)
          ) {
            return false;
          }
          return time >= start && time < end;
        });
      } catch (error) {
        console.error("Erreur lors de la vérification de réservation:", error);
        return false;
      }
    },
    [bookedTimes]
  );

  // Fonction pour vérifier si un créneau chevauche avec les réservations existantes
  const hasConflictWithBookings = useCallback(
    (start: Date, end: Date): boolean => {
      try {
        if (!start || !end || !Array.isArray(bookedTimes)) return false;

        return bookedTimes.some(({ start: bookedStart, end: bookedEnd }) => {
          if (!bookedStart || !bookedEnd) return false;
          return start < bookedEnd && end > bookedStart;
        });
      } catch (error) {
        console.error("Erreur lors de la vérification de conflit:", error);
        return true;
      }
    },
    [bookedTimes]
  );

  // Fonction pour obtenir les créneaux disponibles pour la fin après sélection du début
  const getAvailableEndTimes = useCallback(
    (selectedStartTime: Date): Date[] => {
      if (!selectedStartTime) return [];

      return filteredTimes.filter((time) => {
        if (
          isBefore(time, selectedStartTime) ||
          time.getTime() === selectedStartTime.getTime()
        ) {
          return false;
        }

        // Vérifier qu'il n'y a pas de conflit entre le début et cette heure de fin
        return !hasConflictWithBookings(selectedStartTime, time);
      });
    },
    [filteredTimes, hasConflictWithBookings]
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

  // Fonctions de vérification des tuiles mémoriséEs avec gestion d'erreurs
  const tileDisabled = useCallback(
    ({ date }: { date: Date }) => {
      try {
        return (
          Array.isArray(closedDays) && closedDays.includes(formatISO(date))
        );
      } catch (error) {
        console.error(
          "Erreur lors de la vérification des jours fermés:",
          error
        );
        return true;
      }
    },
    [closedDays]
  );

  const tileClassName = useCallback(
    ({ date }: { date: Date }) => {
      try {
        return Array.isArray(closedDays) && closedDays.includes(formatISO(date))
          ? "closed-day"
          : "";
      } catch (error) {
        console.error("Erreur lors du calcul de la classe CSS:", error);
        return "";
      }
    },
    [closedDays]
  );

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!date) {
        setBookedTimes([]);
        return;
      }

      setIsLoadingBookings(true);
      setBookingError(null);

      try {
        const booked = await getBookedTimes(formatISO(date));

        const validBookedTimes = Array.isArray(booked)
          ? (booked
              .filter(
                (booking) => booking && booking.startTime && booking.endTime
              )
              .map(({ startTime, endTime }) => {
                try {
                  return {
                    start: new Date(startTime),
                    end: new Date(endTime),
                  };
                } catch (dateError) {
                  console.error("Erreur de parsing de date:", dateError);
                  return null;
                }
              })
              .filter(Boolean) as BookedTime[])
          : [];

        setBookedTimes(validBookedTimes);
      } catch (err) {
        console.error("Erreur lors du chargement des créneaux :", err);
        toast.error("Impossible de charger les créneaux réservés", {
          duration: 4000,
          icon: "❌",
        });
        setBookingError(
          "Impossible de charger les créneaux réservés. Veuillez réessayer."
        );
        setBookedTimes([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchBookedTimes();
  }, [date]);

  const handleSelectTime = useCallback(
    (time: Date) => {
      try {
        if (!time || !(time instanceof Date)) {
          console.error("Heure invalide sélectionnée");
          toast.error("Heure invalide sélectionnée");
          return;
        }

        // Si c'est le premier clic (pas d'heure de début sélectionnée)
        if (!startTime) {
          if (isTimeBooked(time)) {
            toast.error("Ce créneau est déjà réservé !", {
              duration: 3000,
              icon: "🚫",
            });
            return;
          }

          setStartTime(time);
          setEndTime(null);
          // SUPPRIMÉ : Le toast "Heure de début sélectionnée". La sélection visuelle est suffisante.
          return;
        }

        // Si on a déjà une heure de début mais pas de fin
        if (!endTime) {
          if (time.getTime() === startTime.getTime()) {
            toast.error(
              "L'heure de fin doit être différente de l'heure de début !",
              {
                duration: 3000,
                icon: "⚠️",
              }
            );
            return;
          }

          if (isBefore(time, startTime)) {
            toast.error("L'heure de fin doit être après l'heure de début !", {
              duration: 3000,
              icon: "⏰",
            });
            return;
          }

          if (hasConflictWithBookings(startTime, time)) {
            toast.error(
              "Ce créneau chevauche avec une réservation existante !",
              {
                duration: 4000,
                icon: "⚠️",
              }
            );
            return;
          }

          setEndTime(time);
          toast.success(
            `Créneau complet : ${format(startTime, "kk:mm")} - ${format(time, "kk:mm")}`,
            {
              duration: 3000,
              icon: "✅",
            }
          );
          return;
        }

        // Si on a déjà les deux heures, on recommence la sélection
        if (isTimeBooked(time)) {
          toast.error("Ce créneau est déjà réservé !", {
            duration: 3000,
            icon: "🚫",
          });
          return;
        }

        setStartTime(time);
        setEndTime(null);
        toast.success(
          `Nouvelle sélection - Heure de début : ${format(time, "kk:mm")}`,
          {
            duration: 2000,
            icon: "🔄",
          }
        );
      } catch (error) {
        console.error("Erreur lors de la sélection de l'heure:", error);
        toast.error("Une erreur est survenue lors de la sélection", {
          duration: 3000,
          icon: "❌",
        });
      }
    },
    [startTime, endTime, isTimeBooked, hasConflictWithBookings]
  );

  const isInRange = useCallback(
    (time: Date): boolean => {
      try {
        return !!(
          startTime &&
          endTime &&
          time instanceof Date &&
          isAfter(time, startTime) &&
          isBefore(time, endTime)
        );
      } catch (error) {
        console.error("Erreur lors du calcul de la plage:", error);
        return false;
      }
    },
    [startTime, endTime]
  );

  const handleReset = useCallback(() => {
    try {
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setBookedTimes([]);
      setBookingError(null);
      toast.success("Sélection réinitialisée", {
        duration: 2000,
        icon: "🔄",
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast.error("Erreur lors de la réinitialisation", {
        duration: 3000,
        icon: "❌",
      });
    }
  }, []);

  const handleConfirm = useCallback(() => {
    try {
      if (!startTime || !endTime) {
        toast.error("Veuillez sélectionner une heure de début et de fin !", {
          duration: 3000,
          icon: "⚠️",
        });
        return;
      }

      if (hasConflictWithBookings(startTime, endTime)) {
        toast.error(
          "Ce créneau entre en conflit avec une réservation existante !",
          {
            duration: 4000,
            icon: "❌",
          }
        );
        return;
      }

      const confirmToast = toast.loading("Redirection en cours...");

      setTimeout(() => {
        toast.dismiss(confirmToast);
        router.push(
          `/serviceList?start=${startTime.toISOString()}&end=${endTime.toISOString()}`
        );
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      toast.error("Une erreur est survenue lors de la confirmation", {
        duration: 3000,
        icon: "❌",
      });
    }
  }, [startTime, endTime, router, hasConflictWithBookings]);

  const handleClickDay = useCallback(
    (selectedDate: Date) => {
      try {
        if (!selectedDate || !(selectedDate instanceof Date)) {
          console.error("Date invalide sélectionnée");
          toast.error("Date invalide sélectionnée");
          return;
        }

        const iso = formatISO(selectedDate);
        if (Array.isArray(closedDays) && closedDays.includes(iso)) {
          toast.error("Ce jour est fermé !", {
            duration: 3000,
            icon: "🚫",
          });
          return;
        }

        setDate(selectedDate);
        setStartTime(null);
        setEndTime(null);
      } catch (error) {
        console.error("Erreur lors de la sélection du jour:", error);
        toast.error("Erreur lors de la sélection du jour", {
          duration: 3000,
          icon: "❌",
        });
      }
    },
    [closedDays]
  );

  // Calcul de la durée du créneau en heures et minutes
  const durationInMinutes = useMemo(() => {
    if (startTime && endTime) {
      return differenceInMinutes(endTime, startTime);
    }
    return 0;
  }, [startTime, endTime]);

  const formattedDuration = useMemo(() => {
    if (durationInMinutes === 0) return "";
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    let durationString = "";
    if (hours > 0) {
      durationString += `${hours}h`;
    }
    if (minutes > 0) {
      durationString += `${minutes}min`;
    }
    return durationString;
  }, [durationInMinutes]);

  return (
    <div className="calendar_container">
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
          {isLoadingBookings && (
            <p className="loading-message">
              Chargement des créneaux disponibles...
            </p>
          )}
          {bookingError && <p className="error-message">{bookingError}</p>}

          {!isLoadingBookings && !bookingError && (
            <>
              {Array.isArray(filteredTimes) && filteredTimes.length > 0 ? (
                <div className="time_grid">
                  {filteredTimes.map((time, i) => {
                    if (!time || !(time instanceof Date)) return null;

                    const isStart = startTime?.getTime() === time.getTime();
                    const isEnd = endTime?.getTime() === time.getTime();
                    const inRange = isInRange(time);
                    const isBooked = isTimeBooked(time);

                    let isDisabled = false;
                    let disabledReason = "";

                    if (isBooked) {
                      isDisabled = true;
                      disabledReason = "Déjà réservé";
                    } else if (startTime && !endTime) {
                      // Mode sélection de l'heure de fin
                      const availableEndTimes = getAvailableEndTimes(startTime);
                      if (
                        !availableEndTimes.some(
                          (availableTime) =>
                            availableTime.getTime() === time.getTime()
                        ) &&
                        time.getTime() !== startTime.getTime()
                      ) {
                        isDisabled = true;
                        disabledReason = "Conflit avec réservation";
                      }
                    }

                    return (
                      <div className="time_bloc" key={`time-${i}`}>
                        <button
                          type="button"
                          className={`btn_times
                            ${isStart ? "selected start" : ""}
                            ${isEnd ? "selected end" : ""}
                            ${inRange ? "in-range" : ""}
                            ${isBooked ? "booked" : ""}
                            ${startTime && !endTime && !isDisabled && isAfter(time, startTime) ? "available-for-end" : ""}
                          `}
                          onClick={() => handleSelectTime(time)}
                          disabled={isDisabled}
                          aria-pressed={isStart || isEnd}
                          aria-label={
                            isBooked
                              ? `Réservé à ${format(time, "kk:mm")}`
                              : `Heure ${format(time, "kk:mm")}`
                          }
                          title={
                            isDisabled
                              ? disabledReason
                              : `Sélectionner ${format(time, "kk:mm")}`
                          }
                        >
                          {format(time, "kk:mm")}
                          {isBooked && (
                            <span className="booked-indicator">🚫</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-times-available">
                  <p>Aucune plage horaire disponible pour cette date.</p>
                  <button
                    className="btn_reset"
                    onClick={() => {
                      setDate(null);
                      toast.error("Choisissez une autre date", {
                        duration: 2000,
                        icon: "📅",
                      });
                    }}
                  >
                    Choisir une autre date
                  </button>
                </div>
              )}
            </>
          )}

          {startTime && endTime && (
            <div className="summary">
              <h4>Votre créneau sélectionné :</h4>
              <p className="highlight">
                📅 {date && format(date, "dd/MM/yyyy")} <br />
                🕐 {format(startTime, "kk:mm")} &rarr;{" "}
                {format(endTime, "kk:mm")}
              </p>
              <p className="duration">Durée : **{formattedDuration}</p>
            </div>
          )}

          <div className="action_buttons">
            <button
              className="btn_confirm"
              onClick={handleConfirm}
              disabled={
                !(startTime && endTime) ||
                hasConflictWithBookings(
                  startTime || new Date(),
                  endTime || new Date()
                )
              }
              aria-disabled={!(startTime && endTime)}
            >
              {startTime && endTime
                ? "Confirmer ma réservation ✅"
                : "Sélectionnez vos heures"}
            </button>
            <button className="btn_reset" onClick={handleReset}>
              🔄 Recommencer
            </button>
          </div>
          {/* Bouton Maintenance pour les test reservation */}
          <Link
            href={`/reservation/test-service?start=${startTime?.toISOString()}&end=${endTime?.toISOString()}`}
            className="button"
            style={{
              backgroundColor: "#009688",
              marginTop: "1rem",
              display: "inline-block",
              padding: "0.5rem 1rem",
              color: "white",
              borderRadius: "4px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            MAINTENANCE: TEST
          </Link>
        </div>
      )}
    </div>
  );
};

export default Calendar;

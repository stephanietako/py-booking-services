"use client";
import type { ServiceHours } from "@prisma/client";
import { format, formatISO, isBefore } from "date-fns";
import ReactCalendar from "react-calendar";
import { FC, useEffect, useState } from "react";
import { Interval, now as serverNow } from "@/app/constants/config";
import { getOpeningTimes, roundToNearestMinutes } from "@/utils/helpers";
import { DateTime } from "@/type";
import { getOpeningHours, getClosedDays } from "@/actions/openingActions";
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";
import { useRouter } from "next/navigation";

interface CalendarProps {
  days: ServiceHours[]; // Utilisation de ServiceHours
  closedDays: string[]; // Jours fermés sous forme de chaînes ISO
}

const Calendar: FC<CalendarProps> = () => {
  const router = useRouter();

  const [days, setDays] = useState<ServiceHours[]>([]);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false); // Pour gérer les différences entre client et serveur
  const [date, setDate] = useState<DateTime>({
    justDate: null,
    dateTime: null,
  });

  // Utilisation de useEffect pour s'assurer que l'on manipule localStorage et router que côté client
  useEffect(() => {
    setIsClient(true); // Cela garantira que l'on n'exécute ce code qu'après le montage côté client
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedDays = await getOpeningHours();
        const fetchedClosedDays = await getClosedDays();
        setDays(fetchedDays);
        setClosedDays(fetchedClosedDays);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (date.dateTime) {
      localStorage.setItem("selectedTime", date.dateTime.toISOString());
      router.push("/service");
    }
  }, [date.dateTime, router]);

  // Calculer le jour actuel seulement côté client
  useEffect(() => {
    if (isClient && days.length) {
      const today = days.find((d) => d.dayOfWeek === format(serverNow, "EEEE"));
      if (today && today.isClosed) {
        setClosedDays((prevClosedDays) => [
          ...prevClosedDays,
          formatISO(new Date().setHours(0, 0, 0, 0)),
        ]);
      }

      // Vérifier si l'heure actuelle est après l'heure de fermeture
      const rounded = roundToNearestMinutes(serverNow, Interval);
      const closingTime = today ? today.closing : null;
      const closing = closingTime
        ? new Date().setHours(closingTime, 0, 0, 0)
        : null;
      const tooLate = closing && !isBefore(rounded, closing);

      if (tooLate && closing) {
        setClosedDays((prevClosedDays) => [
          ...prevClosedDays,
          formatISO(new Date().setHours(0, 0, 0, 0)),
        ]);
      }
    }
  }, [isClient, days]);

  const times = date.justDate && getOpeningTimes(date.justDate, days);

  const handleTimeClick = (time?: ServiceHours) => {
    if (time) {
      const selectedTime = new Date(date.justDate!);
      selectedTime.setHours(time.opening, 0, 0, 0);
      setDate((prev) => ({ ...prev, dateTime: selectedTime }));
    }
  };

  return (
    <div className="calendar_container">
      {date.justDate && (
        <div className="time">
          {times?.map((time, i) => (
            <div key={`time-${i}`}>
              <button onClick={() => handleTimeClick(time)} type="button">
                {format(
                  new Date(date.justDate!).setHours(time.opening, 0, 0, 0),
                  "kk:mm"
                )}{" "}
              </button>
            </div>
          ))}
        </div>
      )}
      {isClient && (
        <ReactCalendar
          minDate={serverNow}
          className="REACT-CALENDAR p-2"
          view="month"
          tileDisabled={({ date }) =>
            closedDays && closedDays.includes(formatISO(date))
          }
          onClickDay={(date) =>
            setDate((prev) => ({ ...prev, justDate: date }))
          }
        />
      )}
    </div>
  );
};

export default Calendar;

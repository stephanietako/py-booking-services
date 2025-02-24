"use client";

import React, { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, formatISO, isBefore, parse } from "date-fns";
import type { Day } from "@prisma/client";
import { getOpeningTimes, roundToNearestMinutes } from "@/utils/helpers";
import { Interval, now } from "@/app/constants/config";
import { DateTime } from "@/types";
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

  // State for selected date and time
  const [date, setDate] = useState<DateTime>({
    justDate: null,
    dateTime: null,
  });

  // Determine if today is closed
  const today = days.find((day) => day.dayOfWeek === now.getDay());
  const rounded = roundToNearestMinutes(now, Interval);
  const closing = today ? parse(today.closeTime, "kk:mm", now) : null;
  const tooLate = closing ? !isBefore(rounded, closing) : false;

  if (tooLate) {
    const todayISO = formatISO(new Date().setHours(0, 0, 0, 0));
    if (!closedDays.includes(todayISO)) closedDays.push(todayISO);
  }

  // Update localStorage and navigate to the service page when a time is selected
  useEffect(() => {
    if (date.dateTime) {
      // Affiche l'heure sélectionnée avant de la stocker
      console.log("Selected date and time:", date.dateTime);

      localStorage.setItem("selectedTime", date.dateTime.toISOString());
      router.push("/serviceList");
    }
  }, [date.dateTime, router]);

  // Get available times for the selected day
  const times = date.justDate && getOpeningTimes(date.justDate, days);

  return (
    <div className="calendar_container">
      {date.justDate ? (
        // Render available times
        <div className="time">
          {times && times.length > 0 ? (
            times.map((time, index) => (
              <div className="time_bloc" key={`time-${index}`}>
                <button
                  className="btn_times"
                  onClick={() =>
                    setDate((prev) => ({ ...prev, dateTime: time }))
                  }
                  type="button"
                  aria-label={`Select time ${format(time, "kk:mm")}`}
                >
                  {format(time, "kk:mm")}
                </button>
              </div>
            ))
          ) : (
            <p>Aucune plage horaire disponible pour cette date.</p>
          )}
        </div>
      ) : (
        <DynamicCalendar
          minDate={now}
          className="REACT-CALENDAR p-2"
          view="month"
          tileDisabled={({ date }) => closedDays.includes(formatISO(date))}
          tileClassName={({ date }) =>
            closedDays.includes(formatISO(date)) ? "closed-day" : ""
          }
          onClickDay={(date, e) => {
            e.preventDefault();
            const dayIso = formatISO(date);
            if (closedDays.includes(dayIso)) {
              // Jour fermé, aucun toast
            } else {
              setDate((prev) => ({ ...prev, justDate: date }));
            }
          }}
        />
      )}
    </div>
  );
};

export default Calendar;

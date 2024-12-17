"use client";

import { type FC, useState } from "react";
import ReactCalendar from "react-calendar";
import { add, format } from "date-fns";
import {
  Service_opening_time,
  Service_closing_time,
  Interval,
} from "@/app/constants/config";
// Styles
import "react-calendar/dist/Calendar.css";
import "./Calendar.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CalendarProps {
  //minDate?: Date;
  //className?: string;
  //view?: "month" | "year" | "decade";
  //   onClickDay?: (value: Date) => Date;
}

interface DateType {
  justDate: Date | null;
  dateTime: Date | null;
}

const Calendar: FC<CalendarProps> = ({}) => {
  const [date, setDate] = useState<DateType>({
    justDate: null,
    dateTime: null,
  });

  console.log(date.dateTime);

  const getTimes = () => {
    if (!date.justDate) return;

    const { justDate } = date;

    // horaires
    const beginning = add(justDate, { hours: Service_opening_time });
    const end = add(justDate, { hours: Service_closing_time });
    const interval = Interval; // minutes

    const times = [];
    for (let i = beginning; i <= end; i = add(i, { minutes: interval })) {
      times.push(i);
    }

    return times;
  };

  const times = getTimes();

  return (
    <div className="calendar_container">
      {date.justDate ? (
        <div className="calendar">
          {times?.map((time, i) => (
            <div key={`times-${i}`} className="calendar_times">
              <button
                className="btn_times"
                type="button"
                onClick={() => setDate((prev) => ({ ...prev, dateTime: time }))}
              >
                {/* kk it's 24h format */}
                {format(time, "kk:mm")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ReactCalendar
          minDate={new Date()}
          className="REACT-CALENDAR"
          view="month"
          onClickDay={(date) =>
            setDate((prev) => ({ ...prev, justDate: date }))
          }
        />
      )}
    </div>
  );
};

export default Calendar;

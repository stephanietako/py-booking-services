// components/BookingCard.tsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { BookingWithDetails } from "@/types";

type BookingCardProps = {
  booking: BookingWithDetails;
  onClick?: () => void; // ✅ Définie ici
};

export default function BookingCard({ booking, onClick }: BookingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded((prev) => !prev);
    if (onClick) onClick(); // ✅ Appelle la fonction si définie
  };

  return (
    <div
      onClick={toggle}
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        cursor: "pointer",
        background: expanded ? "#f9f9f9" : "white",
        transition: "background 0.2s ease-in-out",
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggle();
      }}
      aria-expanded={expanded}
      aria-label={`Détails réservation pour le service ${booking.service?.name || "non défini"}`}
    >
      <p>
        <strong>Service :</strong> {booking.service?.name || "Non défini"}
      </p>
      <p>
        <strong>Date :</strong>{" "}
        {format(new Date(booking.reservedAt), "dd/MM/yyyy HH:mm")}
      </p>

      {expanded && (
        <>
          <p>
            <strong>Client :</strong> {booking.client?.fullName || "N/A"}
          </p>
          {booking.bookingOptions?.length > 0 && (
            <p>
              <strong>Options :</strong>{" "}
              {booking.bookingOptions
                .map((opt) => opt.option?.name)
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

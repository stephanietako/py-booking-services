// CancelBookingModal.tsx
import React from "react";
import { Booking } from "@/types";

interface CancelBookingModalProps {
  booking: Booking;
  onCancel: () => void;
  onConfirm: (bookingId: string) => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="modal">
      <p>Voulez-vous vraiment annuler cette réservation ?</p>
      <button onClick={onCancel}>Non</button>
      <button onClick={() => onConfirm(booking.id)}>Oui</button>
    </div>
  );
};

export default CancelBookingModal;

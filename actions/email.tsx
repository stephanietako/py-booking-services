"use server";

interface Booking {
  id: string;
  reservationTime: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export async function sendBookingToAdmin(booking: Booking, formData: FormData) {
  const payload = {
    bookingId: booking.id,
    reservationTime: booking.reservationTime,
    ...formData,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/sendReservationDetails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Erreur lors de l’envoi de la réservation."
    );
  }

  return await response.json();
}

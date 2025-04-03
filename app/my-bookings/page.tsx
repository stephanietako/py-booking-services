"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserBookings, generateBookingToken } from "@/actions/bookings";
import Link from "next/link";
import Wrapper from "@/app/components/Wrapper/Wrapper";
// Styles
import styles from "./styles.module.scss";
import { Booking } from "@/types";
import Image from "next/image";
import Spinner from "../components/Spinner/Spinner";

const MyBookingPage = () => {
  const { user, isSignedIn } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !isSignedIn) return;

      try {
        const userBookings = await getUserBookings(user.id);
        const bookingsWithTokens = await Promise.all(
          userBookings.map(async (booking) => ({
            ...booking,
            token: await generateBookingToken(booking.id, user.id),
          }))
        );

        setBookings(bookingsWithTokens);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        setError("Impossible de charger vos réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isSignedIn]);

  if (loading) {
    return (
      <Wrapper>
        <Spinner />
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <p className={styles.error}>{error}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section>
        <div className={styles.my_bookings}>
          <div className={styles.my_bookings__container}>
            <div className={styles.logo_title_wrapper}>
              <div className={styles.logo_container}>
                <Image
                  src="/assets/logo/hippo.png"
                  alt="Logo"
                  width={100}
                  height={110}
                />
              </div>
              <h1 className={styles.title}>Ma réservation</h1>
            </div>
            {bookings.length === 0 ? (
              <p className={styles.noBookings}>Aucune réservation trouvée.</p>
            ) : (
              <div className={styles.bookings_list}>
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.bookings_cards}>
                    <div
                      key={booking.id}
                      className={styles.bookings_cards__content}
                    >
                      <h2>{booking.service.name}</h2>
                      <p>
                        <strong>Date :</strong>{" "}
                        {new Date(booking.startTime).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <p>
                        <strong>Heure :</strong>{" "}
                        {new Date(booking.startTime).toLocaleTimeString(
                          "fr-FR"
                        )}{" "}
                        -{" "}
                        {new Date(booking.endTime).toLocaleTimeString("fr-FR")}
                      </p>
                      <p>
                        <strong>Statut :</strong>{" "}
                        <span className={styles.status}>{booking.status}</span>
                      </p>
                      <p>
                        <strong>Montant :</strong>{" "}
                        <span className={styles.price}>
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(booking.totalAmount)}
                        </span>
                      </p>
                      <Link
                        href={`/manage-booking?token=${booking.token}`}
                        className={styles.manageButton}
                      >
                        ⚓️ Gérer ma réservation
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default MyBookingPage;

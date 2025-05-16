"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllServices, getDynamicPrice } from "@/actions/actions";
import { createBooking, deleteUserBooking } from "@/actions/bookings";
import { Service, Booking } from "@/types";
import Wrapper from "../Wrapper/Wrapper";
import styles from "./styles.module.scss";
import { useUser } from "@clerk/nextjs";
import { format, formatISO, parseISO } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const ServiceList = () => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseServicePrice, setBaseServicePrice] = useState<number | null>(null); // Prix du service (dynamique ou par défaut)
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllServices();
        if (data && data.length > 0) {
          setService(data[0]);
          const startParam = searchParams.get("start");
          const endParam = searchParams.get("end");

          let price = data[0].defaultPrice;
          if (startParam && endParam && data[0].id) {
            price = await getDynamicPrice(data[0].id, startParam, endParam);
          }
          setBaseServicePrice(price);
          setStartTime(startParam);
          setEndTime(endParam);
        } else {
          setError("Aucun service disponible.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du service.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleBooking = useCallback(async () => {
    if (!service || baseServicePrice === null) return;
    const userId = user?.id || null;
    const hasClientInfo =
      clientInfo.fullName.trim() !== "" &&
      clientInfo.email.trim() !== "" &&
      clientInfo.phoneNumber.trim() !== "";

    if (!startTime || !endTime) {
      return toast.error("Veuillez sélectionner un horaire.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }
    const startISO = parseISO(startTime);
    const endISO = parseISO(endTime);
    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      return toast.error("Les horaires sélectionnés sont invalides.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    setIsBooking(true);

    try {
      const bookingResult: { booking: Booking; token?: string } | null =
        await createBooking(
          userId,
          service.id,
          formatISO(startISO),
          startTime,
          endTime,
          [], // plus d'options, donc tableau vide
          false,
          hasClientInfo ? clientInfo.fullName : undefined,
          hasClientInfo ? clientInfo.email : undefined,
          hasClientInfo ? clientInfo.phoneNumber : undefined
        );

      if (bookingResult?.booking?.id && bookingResult.token) {
        setBookingId(String(bookingResult.booking.id));
        setBookingMessage(
          `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
        );
        toast.success("Réservation réussie ! Redirection...", {
          ariaProps: { role: "status", "aria-live": "polite" },
        });
        router.push(`/booking/verify?token=${bookingResult.token}`);
      } else {
        toast.error("Erreur lors de la création de la réservation.", {
          ariaProps: { role: "alert", "aria-live": "assertive" },
        });
      }
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Erreur lors de la réservation.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage, {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    } finally {
      setIsBooking(false);
    }
  }, [
    user?.id,
    service,
    startTime,
    endTime,
    clientInfo,
    router,
    baseServicePrice,
  ]);

  const handleCancelBooking = useCallback(async () => {
    if (!bookingId || !service?.id) return;

    const userIdToDelete = user?.id;
    if (userIdToDelete) {
      const result = await deleteUserBooking(bookingId, userIdToDelete);
      toast.success(result.message, {
        ariaProps: { role: "status", "aria-live": "assertive" },
      });
      setBookingId(null);
      setBookingMessage(null);
    } else {
      toast.error(
        "Impossible d'annuler la réservation pour un utilisateur non connecté via cette méthode.",
        { ariaProps: { role: "alert", "aria-live": "assertive" } }
      );
    }
  }, [bookingId, user?.id, service?.id]);

  if (loading) {
    return <p>Chargement du service...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!service) {
    return <p>Aucun service disponible.</p>;
  }

  return (
    <Wrapper>
      <div className={styles.service_list}>
        <li className={styles.service_item}>
          <div className={styles.service_item__content}>
            <div className={styles.__img_content}>
              <Image
                src={service.imageUrl || "/assets/logo/logo-full.png"}
                alt={`Excursion en mer : ${service.name}`}
                width={200}
                height={200}
                className={styles.__img}
              />
            </div>

            <div className={styles.service_item__details}>
              <div className={styles.service_item__infos}>
                <span className={styles.service_item__title}>
                  {service.name}
                </span>
                <span className={styles.service_item__description}>
                  {service.description
                    ?.split("\n")
                    .map((line, index) => <span key={index}>{line}</span>)}
                </span>
              </div>

              <div className={styles.service_item__stats}>
                <span>
                  {baseServicePrice !== null
                    ? new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: service.currency || "EUR",
                      }).format(baseServicePrice)
                    : "Chargement du prix..."}
                </span>
              </div>

              {!user && (
                <div className={styles.anonymous_booking_form}>
                  <h3>Informations de réservation</h3>
                  <label htmlFor="fullName">Nom complet:</label>
                  <input
                    type="text"
                    id="fullName"
                    value={clientInfo.fullName}
                    onChange={(e) =>
                      setClientInfo({ ...clientInfo, fullName: e.target.value })
                    }
                    required
                  />
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    value={clientInfo.email}
                    onChange={(e) =>
                      setClientInfo({ ...clientInfo, email: e.target.value })
                    }
                    required
                  />
                  <label htmlFor="phoneNumber">Téléphone:</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={clientInfo.phoneNumber}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        phoneNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={isBooking || baseServicePrice === null} // Désactiver si le prix n'est pas chargé
                className={isBooking ? styles.loading : ""}
              >
                {isBooking ? "Réservation en cours..." : "Réserver ce service"}
              </button>

              {bookingId && (
                <button
                  onClick={handleCancelBooking}
                  className={styles.cancelButton}
                  aria-label="Annuler ma réservation"
                >
                  Annuler ma réservation
                </button>
              )}
            </div>
          </div>
          {bookingMessage && (
            <div className={styles.bookingConfirmationMessage}>
              <p>{bookingMessage}</p>
            </div>
          )}
        </li>
      </div>
    </Wrapper>
  );
};

export default ServiceList;
/////////////////////////

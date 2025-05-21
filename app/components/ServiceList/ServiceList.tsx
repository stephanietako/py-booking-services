"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllServices, getDynamicPrice } from "@/actions/actions";
import { createBooking, deleteUserBooking } from "@/actions/bookings";
import { Service, Booking, Option as OptionType } from "@/types";
import Wrapper from "../Wrapper/Wrapper";
import { useUser } from "@clerk/nextjs";
import { format, formatISO, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
// Styles
import styles from "./styles.module.scss";
import FormattedDescription from "../FormattedDescription/FormattedDescription";

const captainPrice = 350; // Prix fixe du capitaine

const ServiceList = () => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseServicePrice, setBaseServicePrice] = useState<number | null>(null);
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
  const [availableOptions, setAvailableOptions] = useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, { quantity: number; unitPrice: number; label: string }>
  >({});
  const [withCaptain, setWithCaptain] = useState(false);
  const [mealOption, setMealOption] = useState(false);
  const [requiresCaptain, setRequiresCaptain] = useState(true); // Par défaut à true

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllServices();
        if (data && data.length > 0) {
          setService(data[0]);
          setRequiresCaptain(data[0].requiresCaptain ?? true);
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/options");
        if (response.ok) {
          const data = await response.json();
          setAvailableOptions(data);
          console.log(
            "Options récupérées de l'API :",
            data.map((opt: OptionType) => opt.id)
          );
        } else {
          console.error("Erreur lors de la récupération des options");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des options :", error);
      }
    };

    fetchOptions();
  }, []);

  const handleOptionQuantityChange = (option: OptionType, quantity: number) => {
    const newSelectedOptions = { ...selectedOptions };
    if (quantity > 0) {
      newSelectedOptions[option.id] = {
        quantity,
        unitPrice: option.unitPrice,
        label: option.label,
      };
    } else {
      delete newSelectedOptions[option.id];
    }
    setSelectedOptions(newSelectedOptions);
  };

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
      const selectedBookingOptions = Object.entries(selectedOptions).map(
        ([optionId, details]) => ({
          optionId,
          quantity: details.quantity,
          unitPrice: details.unitPrice,
          label: details.label,
        })
      );

      const bookingResult: { booking: Booking; token?: string } | null =
        await createBooking(
          userId,
          service.id,
          formatISO(startISO),
          startTime,
          endTime,
          selectedBookingOptions.map((opt) => ({
            optionId: opt.optionId,
            quantity: opt.quantity,
          })),
          withCaptain,
          mealOption,
          hasClientInfo ? clientInfo.fullName : undefined,
          hasClientInfo ? clientInfo.email : undefined,
          hasClientInfo ? clientInfo.phoneNumber : undefined,
          captainPrice
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
    selectedOptions,
    withCaptain,
    mealOption,
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

  const handleWithCaptainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithCaptain(e.target.checked);
  };

  const handleMealOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMealOption(e.target.checked);
  };

  const currentOptionsSubtotal = Object.values(selectedOptions).reduce(
    (sum, details) => sum + details.quantity * details.unitPrice,
    0
  );

  const displayedSubtotal = withCaptain
    ? currentOptionsSubtotal
    : currentOptionsSubtotal + captainPrice;

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
      <section>
        <div className={styles.service_list}>
          <li className={styles.service_item}>
            <div className={styles.service_item__content}>
              {/* COLONNE GAUCHE */}
              <div className={styles.left_column}>
                <div className={styles.service_item__details}>
                  <div className={styles.service_item__infos}>
                    <h1 className={styles.service_item__title}>
                      {service.name}
                    </h1>
                    <br />
                    <FormattedDescription text={service.description || ""} />
                  </div>

                  <div className={styles.service_item__stats}>
                    <span>
                      <p>Montant location bateau:</p>
                      {baseServicePrice !== null
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: service.currency || "EUR",
                          }).format(baseServicePrice)
                        : "Chargement du prix..."}
                    </span>
                  </div>

                  <h2>Options supplémentaires (à régler sur place)</h2>
                  <p className={styles.notice} style={{ color: "whitesmoke" }}>
                    Les options sélectionnées sont à régler à bord le jour de
                    votre reservation.
                  </p>
                  <div className={styles.options_list}>
                    {availableOptions.map((option) => (
                      <div key={option.id} className={styles.option_item}>
                        <span>
                          {option.label} (
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: service?.currency || "EUR",
                          }).format(option.unitPrice)}
                          / unité)
                        </span>
                        {option.payableAtBoard && (
                          <div>
                            <label htmlFor={`quantity-${option.id}`}>
                              Quantité:
                            </label>
                            <input
                              type="number"
                              id={`quantity-${option.id}`}
                              min="0"
                              defaultValue={
                                selectedOptions[option.id]?.quantity || 0
                              }
                              onChange={(e) =>
                                handleOptionQuantityChange(
                                  option,
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={styles.captain_option}>
                    <label>
                      J&apos;ai mon propre capitaine:
                      <input
                        type="checkbox"
                        checked={withCaptain}
                        onChange={handleWithCaptainChange}
                      />
                    </label>
                    {requiresCaptain && !withCaptain && (
                      <p className={styles.captain_required}>
                        (Capitaine obligatoire si non fourni)
                      </p>
                    )}
                    {requiresCaptain && !withCaptain && (
                      <p className={styles.captain_required}>
                        (Prix du capitaine :{" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: service?.currency || "EUR",
                        }).format(captainPrice)}{" "}
                        payable à bord)
                      </p>
                    )}
                  </div>

                  <div className={styles.meal_option}>
                    <label>
                      Commander un repas traiteur:
                      <input
                        type="checkbox"
                        checked={mealOption}
                        onChange={handleMealOptionChange}
                      />
                    </label>
                    <p className={styles.meal_option_description}>
                      Cochez cette case si vous souhaitez commander un repas via
                      notre traiteur partenaire. L&apos;administrateur vous
                      contactera pour vous présenter le menu et les prix. Le
                      paiement s&apos;effectuera à bord.
                    </p>
                  </div>
                  {Object.values(selectedOptions).length > 0 || !withCaptain ? (
                    <div className={styles.options_subtotal}>
                      Sous-total (options{" "}
                      {Object.values(selectedOptions).length > 0 &&
                        "+ capitaine"}
                      ):{" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: service?.currency || "EUR",
                      }).format(displayedSubtotal)}
                      {!withCaptain &&
                        Object.values(selectedOptions).length === 0 &&
                        requiresCaptain && <span>(incluant le capitaine)</span>}
                    </div>
                  ) : (
                    <div className={styles.options_subtotal}>
                      Sous-total des options :{" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: service?.currency || "EUR",
                      }).format(currentOptionsSubtotal)}
                    </div>
                  )}
                </div>
              </div>

              {/* COLONNE DROITE */}
              <div className={styles.bloc__right_column}>
                <div className={styles.right_column}>
                  {!user && (
                    <div className={styles.anonymous_booking_form}>
                      <h2>Informations de réservation</h2>
                      <label htmlFor="fullName">Nom complet:</label>
                      <input
                        type="text"
                        id="fullName"
                        value={clientInfo.fullName}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                      <label htmlFor="email">Email:</label>
                      <input
                        type="email"
                        id="email"
                        value={clientInfo.email}
                        onChange={(e) =>
                          setClientInfo({
                            ...clientInfo,
                            email: e.target.value,
                          })
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
                    disabled={isBooking || baseServicePrice === null}
                    className={isBooking ? styles.loading : ""}
                  >
                    {isBooking
                      ? "Réservation en cours..."
                      : "Réserver ce service"}
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
            </div>

            {bookingMessage && (
              <div className={styles.bookingConfirmationMessage}>
                <p>{bookingMessage}</p>
              </div>
            )}
          </li>
        </div>
      </section>
    </Wrapper>
  );
};

export default ServiceList;

// app/components/TestReservationForm/TestReservationForm.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllServices } from "@/actions/actions";
import { createBooking } from "@/actions/bookings"; // Assurez-vous que le chemin est correct
import { Service, Booking, Option as OptionType } from "@/types";
import Wrapper from "../Wrapper/Wrapper";
import { useUser } from "@clerk/nextjs";
import { format, formatISO, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./styles.module.scss";
import FormattedDescription from "../FormattedDescription/FormattedDescription";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const ServiceListTestReservation = () => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseServicePrice, setBaseServicePrice] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
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
  const [mealOption, setMealOption] = useState(false);
  const withCaptainForced = true;
  const [comment, setComment] = useState("");

  const MAX_QUANTITY = 10;
  const MAX_QUANTITY_PADDLE = 1;

  // Fonction utilitaire pour valider les chaînes ISO
  const isValidISOString = (str: string): boolean => {
    try {
      const date = new Date(str);
      return (
        date instanceof Date && !isNaN(date.getTime()) && str.includes("T")
      );
    } catch {
      return false;
    }
  };

  // Debug des paramètres URL
  useEffect(() => {
    console.log("=== DEBUG PARAMS ===");
    console.log("Search params:", searchParams.toString());
    console.log("Start param:", searchParams.get("start"));
    console.log("End param:", searchParams.get("end"));
    console.log("All params:", Object.fromEntries(searchParams.entries()));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllServices(); // Ceci récupère tous les services
        if (data && data.length > 0) {
          // MODIFICATION CLÉ ICI : Trouvez spécifiquement le "Test Service"
          const testService = data.find((s) => s.name === "Test Service");

          if (testService) {
            setService(testService); // Utilisez le "Test Service"
            setBaseServicePrice(1); // Forcez le prix à 1 pour le test, comme prévu
          } else {
            setError(
              "Le service 'Test Service' n'a pas été trouvé. Assurez-vous que votre seed l'a bien créé."
            );
            setLoading(false);
            return;
          }

          const startParam = searchParams.get("start");
          const endParam = searchParams.get("end");

          console.log("=== FETCHING DATA ===");
          console.log("Start param:", startParam);
          console.log("End param:", endParam);

          // Vérification robuste des paramètres
          if (!startParam || !endParam) {
            console.warn("Paramètres manquants dans l'URL:", {
              startParam,
              endParam,
            });
            setError(
              "Aucun horaire sélectionné. Veuillez retourner au calendrier pour choisir un créneau."
            );
            return;
          }

          // Vérification que les paramètres sont des chaînes ISO valides
          if (!isValidISOString(startParam) || !isValidISOString(endParam)) {
            console.error("Paramètres ISO invalides:", {
              startParam,
              endParam,
            });
            setError(
              "Les horaires sélectionnés ne sont pas valides. Veuillez retourner au calendrier."
            );
            return;
          }

          // Test de parsing des dates
          try {
            const testStartDate = parseISO(startParam);
            const testEndDate = parseISO(endParam);

            if (
              isNaN(testStartDate.getTime()) ||
              isNaN(testEndDate.getTime())
            ) {
              console.error("Dates invalides après parsing:", {
                testStartDate,
                testEndDate,
              });
              setError(
                "Erreur lors de l'analyse des horaires. Veuillez retourner au calendrier."
              );
              return;
            }

            console.log("Dates parsées avec succès:", {
              testStartDate,
              testEndDate,
            });
          } catch (parseError) {
            console.error("Erreur de parsing des dates:", parseError);
            setError(
              "Erreur lors de l'analyse des horaires. Veuillez retourner au calendrier."
            );
            return;
          }

          // Si tout est OK, on peut setter les horaires
          setStartTime(startParam);
          setEndTime(endParam);
          console.log("Horaires setés avec succès:", { startParam, endParam });
        } else {
          setError("Aucun service disponible.");
        }
      } catch (err) {
        console.error("Erreur lors du chargement du service:", err);
        setError("Erreur lors du chargement du service.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Debug des états
  useEffect(() => {
    console.log("=== DEBUG STATES ===");
    console.log("StartTime:", startTime, "Type:", typeof startTime);
    console.log("EndTime:", endTime, "Type:", typeof endTime);
    console.log("Service:", service?.name);
    console.log("BaseServicePrice:", baseServicePrice);
  }, [startTime, endTime, service, baseServicePrice]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/options");
        if (response.ok) {
          const data: OptionType[] = await response.json();

          // Forcer toutes les options à 0€ pour le test
          const testOptions = data.map((option) => ({
            ...option,
            unitPrice: 0, // Forcer le prix à 0 pour le test
          }));

          setAvailableOptions(testOptions);

          // Initialiser selectedOptions à 0 pour toutes les options
          const initialSelected: Record<
            string,
            { quantity: number; unitPrice: number; label: string }
          > = {};
          testOptions.forEach((option) => {
            initialSelected[option.id] = {
              quantity: 0,
              unitPrice: 0, // Également 0 ici
              label: option.label,
            };
          });
          setSelectedOptions(initialSelected);
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
    const maxQuantity =
      option.name === "paddle-supplementaire"
        ? MAX_QUANTITY_PADDLE
        : MAX_QUANTITY;

    const limitedQty = Math.min(Math.max(quantity, 0), maxQuantity);

    const newSelectedOptions = { ...selectedOptions };

    newSelectedOptions[option.id] = {
      quantity: limitedQty,
      unitPrice: 0, // Forcer à 0 pour le test
      label: option.label,
    };

    setSelectedOptions(newSelectedOptions);
  };

  const handleBooking = useCallback(async () => {
    console.log("=== DEBUT HANDLE BOOKING ===");
    console.log("withCaptainForced:", withCaptainForced);
    console.log("service:", service);
    console.log("baseServicePrice:", baseServicePrice);
    console.log("startTime:", startTime, "type:", typeof startTime);
    console.log("endTime:", endTime, "type:", typeof endTime);

    if (withCaptainForced !== true) {
      return toast.error(
        "Le choix de capitaine est forcé sur 'J'ai mon propre capitaine' dans cette version de test.",
        { ariaProps: { role: "alert", "aria-live": "assertive" } }
      );
    }

    if (!service || baseServicePrice === null) {
      console.error("Service ou prix de base manquant:", {
        service,
        baseServicePrice,
      });
      return toast.error("Erreur: Service non disponible.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    const userId = user?.id || null;
    const hasClientInfo =
      clientInfo.fullName.trim() !== "" &&
      clientInfo.email.trim() !== "" &&
      clientInfo.phoneNumber.trim() !== "";

    // Vérification améliorée des horaires
    if (!startTime || !endTime) {
      console.error("Horaires manquants:", { startTime, endTime });
      return toast.error(
        "Veuillez sélectionner un horaire depuis le calendrier.",
        {
          ariaProps: { role: "alert", "aria-live": "assertive" },
        }
      );
    }

    // Vérification que les horaires sont des chaînes valides
    if (typeof startTime !== "string" || typeof endTime !== "string") {
      console.error("Horaires invalides:", {
        startTime,
        endTime,
        types: { start: typeof startTime, end: typeof endTime },
      });
      return toast.error("Les horaires sélectionnés ne sont pas valides.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    // Validation supplémentaire des chaînes ISO
    if (!isValidISOString(startTime) || !isValidISOString(endTime)) {
      console.error("Format ISO invalide:", { startTime, endTime });
      return toast.error("Format des horaires invalide.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    let startISO: Date;
    let endISO: Date;

    try {
      startISO = parseISO(startTime);
      endISO = parseISO(endTime);
      console.log("Dates parsées:", { startISO, endISO });
    } catch (parseError) {
      console.error("Erreur de parsing des dates:", parseError, {
        startTime,
        endTime,
      });
      return toast.error("Erreur lors de l'analyse des horaires.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      console.error("Dates invalides après parsing:", {
        startISO,
        endISO,
        startTime,
        endTime,
      });
      return toast.error("Les horaires sélectionnés sont invalides.", {
        ariaProps: { role: "alert", "aria-live": "assertive" },
      });
    }

    // Validation des informations client si non connecté
    if (!user) {
      if (!clientInfo.fullName.trim()) {
        toast.error("Le nom complet est requis.");
        return;
      }
      if (!/^[\w\sÀ-ÿ'-]+$/.test(clientInfo.fullName)) {
        toast.error("Le nom contient des caractères invalides.");
        return;
      }
      if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(clientInfo.email)) {
        toast.error("L'email n'est pas valide.");
        return;
      }
      if (!isValidPhoneNumber(clientInfo.phoneNumber || "")) {
        toast.error("Le numéro de téléphone n'est pas valide.");
        return;
      }
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

      console.log("Données de réservation:", {
        userId,
        serviceId: service.id,
        startISO: formatISO(startISO),
        startTime,
        endTime,
        selectedBookingOptions,
        withCaptainForced,
        mealOption,
        clientInfo: hasClientInfo ? clientInfo : null,
        comment,
      });

      const bookingResult: { booking: Booking; token?: string } | null =
        await createBooking(
          userId,
          service.id, // L'ID du service est maintenant garanti être celui du "Test Service"
          formatISO(startISO),
          startTime,
          endTime,
          selectedBookingOptions.map((opt) => ({
            optionId: opt.optionId,
            quantity: opt.quantity,
          })),
          withCaptainForced,
          mealOption,
          hasClientInfo ? clientInfo.fullName : undefined,
          hasClientInfo ? clientInfo.email : undefined,
          hasClientInfo ? clientInfo.phoneNumber : undefined,
          comment
        );

      console.log("Résultat de la réservation:", bookingResult);

      if (bookingResult?.booking?.id && bookingResult.token) {
        setBookingMessage(
          `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
        );
        toast.success("Opération réussie ... Redirection ", {
          ariaProps: { role: "status", "aria-live": "polite" },
        });
        router.push(`/booking/verify-booking?token=${bookingResult.token}`);
      } else {
        console.error("Résultat de réservation invalide:", bookingResult);
        toast.error("Erreur lors de la création de la réservation.", {
          ariaProps: { role: "alert", "aria-live": "assertive" },
        });
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la réservation:", error);
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
    withCaptainForced,
    service,
    baseServicePrice,
    startTime,
    endTime,
    user,
    clientInfo,
    selectedOptions,
    mealOption,
    comment,
    router,
  ]);

  const handleMealOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMealOption(e.target.checked);
  };

  const currentOptionsSubtotal = Object.values(selectedOptions).reduce(
    (sum, details) => sum + details.quantity * details.unitPrice,
    0
  );

  const displayedSubtotal = currentOptionsSubtotal;

  if (loading) {
    return (
      <Wrapper>
        <div className={styles.service_list}>
          <p>Chargement du service...</p>
        </div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <div className={styles.service_list}>
          <div className={styles.error_container}>
            <p
              className="error"
              style={{
                color: "#ff6b6b",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              {error}
            </p>
            <button
              onClick={() => router.push("/")}
              className={styles.button}
              style={{
                backgroundColor: "#4da6ff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Retour au calendrier
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!service) {
    return (
      <Wrapper>
        <div className={styles.service_list}>
          <p>Aucun service disponible.</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section>
        <div className={styles.service_list}>
          <li className={styles.service_item}>
            <div className={styles.service_item__content}>
              <div className={styles.left_column}>
                <div className={styles.service_item__details}>
                  <div className={styles.service_item__infos}>
                    <h1 className={styles.service_item__title}>
                      {service.name} (Test réservation)
                    </h1>
                    <br />
                    <FormattedDescription text={service.description || ""} />
                  </div>
                  <div className={styles.service_item__stats}>
                    <span>
                      <p>Montant location bateau (test):</p>
                      {baseServicePrice !== null
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: service.currency || "EUR",
                          }).format(baseServicePrice)
                        : "Chargement du prix..."}
                    </span>
                  </div>
                  {startTime && endTime && (
                    <div className={styles.selected_times}>
                      <p>
                        🗓 Réservation prévue le{" "}
                        <strong>
                          {format(parseISO(startTime), "dd/MM/yyyy")} de{" "}
                          {format(parseISO(startTime), "HH:mm")} à{" "}
                          {format(parseISO(endTime), "HH:mm")}
                        </strong>
                      </p>
                    </div>
                  )}
                  <h2>Options supplémentaires (à régler sur place)</h2>
                  <p className={styles.notice} style={{ color: "whitesmoke" }}>
                    Les options sélectionnées sont à régler à bord le jour de
                    votre réservation.
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
                              max={
                                option.name === "paddle-supplementaire" ? 1 : 10
                              }
                              value={selectedOptions[option.id]?.quantity || 0}
                              onChange={(e) =>
                                handleOptionQuantityChange(
                                  option,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              readOnly={option.unitPrice === 0}
                              tabIndex={option.unitPrice === 0 ? -1 : 0}
                              onFocus={(e) => {
                                if (option.unitPrice === 0) {
                                  e.target.blur();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (option.unitPrice === 0) {
                                  e.preventDefault();
                                }
                              }}
                              onMouseDown={(e) => {
                                if (option.unitPrice === 0) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                    Sous-total options sélectionnées :{" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: service.currency || "EUR",
                    }).format(displayedSubtotal)}
                  </p>

                  <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
                    Option capitaine forcée (test) : J&apos;ai mon propre
                    capitaine
                  </p>

                  <div className={styles.booking_form}>
                    {!user && (
                      <>
                        <label htmlFor="fullName">Nom complet :</label>
                        <input
                          type="text"
                          id="fullName"
                          value={clientInfo.fullName}
                          onChange={(e) =>
                            setClientInfo((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          required
                        />
                        <label htmlFor="email">Email :</label>
                        <input
                          type="email"
                          id="email"
                          value={clientInfo.email}
                          onChange={(e) =>
                            setClientInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                        <label htmlFor="phoneNumber">Téléphone :</label>
                        <PhoneInput
                          id="phoneNumber"
                          defaultCountry="FR"
                          value={clientInfo.phoneNumber}
                          onChange={(value) =>
                            setClientInfo((prev) => ({
                              ...prev,
                              phoneNumber: value || "",
                            }))
                          }
                          required
                        />
                      </>
                    )}
                    <div className={styles.meal_option}>
                      <label>
                        Commander un repas traiteur:
                        <input
                          type="checkbox"
                          checked={mealOption}
                          onChange={handleMealOptionChange}
                        />
                      </label>
                    </div>

                    <label htmlFor="comment">Commentaire :</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <button
                      onClick={handleBooking}
                      disabled={isBooking || !startTime || !endTime}
                      type="button"
                      style={{
                        backgroundColor:
                          !startTime || !endTime ? "#ccc" : "#4da6ff",
                        cursor:
                          !startTime || !endTime ? "not-allowed" : "pointer",
                        opacity: !startTime || !endTime ? 0.6 : 1,
                      }}
                    >
                      {isBooking ? "Réservation en cours..." : "Réserver"}
                    </button>
                  </div>
                  {bookingMessage && <p>{bookingMessage}</p>}
                </div>
              </div>
            </div>
          </li>
        </div>
      </section>
    </Wrapper>
  );
};

export default ServiceListTestReservation;

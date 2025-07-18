// app/components/ServiceList/ServiceList.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllServices, getDynamicPrice } from "@/actions/actions";
import { createBooking } from "@/actions/bookings";
import { Service, Booking, Option as OptionType } from "@/types";
import Wrapper from "../Wrapper/Wrapper";
import { useUser } from "@clerk/nextjs";
import { format, formatISO, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
// Styles
import styles from "./styles.module.scss";
import FormattedDescription from "../FormattedDescription/FormattedDescription";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const ServiceList = () => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseServicePrice, setBaseServicePrice] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [requiresCaptain, setRequiresCaptain] = useState(true);
  const [comment, setComment] = useState("");
  const [withCaptain, setWithCaptain] = useState<boolean | null>(null);
  // Limites de quantité
  const MAX_QUANTITY = 10;
  const MAX_QUANTITY_PADDLE = 1;

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
    // Limites sur quantité selon option
    const maxQuantity =
      option.name === "paddle-supplementaire"
        ? MAX_QUANTITY_PADDLE
        : MAX_QUANTITY;

    const limitedQty = Math.min(Math.max(quantity, 0), maxQuantity);

    const newSelectedOptions = { ...selectedOptions };

    if (limitedQty > 0) {
      newSelectedOptions[option.id] = {
        quantity: limitedQty,
        unitPrice: option.unitPrice,
        label: option.label,
      };
    } else {
      delete newSelectedOptions[option.id];
    }
    setSelectedOptions(newSelectedOptions);
  };

  const handleBooking = useCallback(async () => {
    if (withCaptain !== true && withCaptain !== false) {
      return toast.error(
        "Vous devez choisir si vous avez votre propre capitaine ou si vous sollicitez notre capitaine.",
        { ariaProps: { role: "alert", "aria-live": "assertive" } }
      );
    }
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

    // Validation front supplémentaire pour les champs client
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
          comment
        );

      if (bookingResult?.booking?.id && bookingResult.token) {
        setBookingMessage(
          `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
        );
        toast.success("Opération réussie ... Redirection ", {
          ariaProps: { role: "status", "aria-live": "polite" },
        });
        router.push(`/booking/verify-booking?token=${bookingResult.token}`);
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
    service,
    baseServicePrice,
    user,
    clientInfo.fullName,
    clientInfo.email,
    clientInfo.phoneNumber,
    startTime,
    endTime,
    selectedOptions,
    withCaptain,
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

  const displayedSubtotal =
    withCaptain === false
      ? currentOptionsSubtotal + (service?.captainPrice ?? 350)
      : currentOptionsSubtotal;

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
        <div className={styles.service_list__container}>
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
                    <h2 className={styles.title}>
                      Options supplémentaires (à régler sur place)
                    </h2>
                    <p
                      className={styles.notice}
                      style={{ color: "whitesmoke" }}
                    >
                      Les options sélectionnées sont à régler à bord le jour de
                      votre réservation.
                    </p>
                    <div className={styles.options_list}>
                      {availableOptions
                        .filter(
                          (option) =>
                            option.label.toLowerCase() !== "capitaine à bord"
                        )
                        .map((option) => (
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
                                    option.name === "paddle-supplementaire"
                                      ? 1
                                      : 10
                                  }
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
                    <div className={styles.captain_radio_group}>
                      <label className={styles.captain_radio_label}>
                        <input
                          type="radio"
                          name="captain"
                          className={styles.captain_radio_input}
                          checked={withCaptain === true}
                          onChange={() => setWithCaptain(true)}
                        />
                        J&apos;ai mon propre capitaine
                        <span className={styles.tooltip}>
                          <span className={styles.tooltip_icon}>?</span>
                          <span className={styles.tooltip_text}>
                            Vous devrez fournir un diplôme professionnel valide
                            avant le départ.
                          </span>
                        </span>
                      </label>
                      <label className={styles.captain_radio_label}>
                        <input
                          type="radio"
                          name="captain"
                          className={styles.captain_radio_input}
                          checked={withCaptain === false}
                          onChange={() => setWithCaptain(false)}
                        />
                        Je sollicite votre capitaine (350 € à régler à bord)
                        <span className={styles.tooltip}>
                          <span className={styles.tooltip_icon}>?</span>
                          <span className={styles.tooltip_text}>
                            Un capitaine professionnel vous sera attribué.
                            Tarif : 350 € à régler à bord.
                          </span>
                        </span>
                      </label>
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
                        Cochez cette case si vous souhaitez commander un repas
                        via notre traiteur partenaire. L&apos;administrateur
                        vous contactera pour vous présenter le menu et les prix.
                        Le paiement s&apos;effectuera à bord.
                      </p>
                    </div>

                    <div className={styles.cgu_notice}>
                      En réservant, vous acceptez nos{" "}
                      <a
                        href="/assets/pdf/cgu.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cgu_link}
                      >
                        Conditions Générales d’Utilisation
                      </a>
                      .
                    </div>
                    {Object.values(selectedOptions).length > 0 ||
                    !withCaptain ? (
                      <div className={styles.options_subtotal}>
                        Sous-total (options{" "}
                        {Object.values(selectedOptions).length > 0 &&
                          "+ capitaine si sollicité"}
                        ):{" "}
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: service?.currency || "EUR",
                        }).format(displayedSubtotal)}
                        {!withCaptain &&
                          Object.values(selectedOptions).length === 0 &&
                          requiresCaptain && (
                            <span>(incluant le capitaine si sollicité)</span>
                          )}
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
                    <div className={styles.comment_section}>
                      <label htmlFor="comment">
                        Commentaire (ex : enfant à bord, personne à mobilité
                        réduite, demande particulière) :
                        <span
                          style={{
                            fontSize: "0.9em",
                            color: "#888",
                            marginLeft: 8,
                          }}
                        >
                          (500 caractères maximum)
                        </span>
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => {
                          if (e.target.value.length <= 500)
                            setComment(e.target.value);
                        }}
                        maxLength={500}
                        placeholder="Votre message pour l'administrateur..."
                        rows={3}
                        style={{ width: "100%", marginBottom: "1rem" }}
                      />
                      <span style={{ fontSize: "0.9em", color: "#888" }}>
                        {comment.length}/500 caractères saisis
                      </span>
                    </div>
                    {!user && (
                      <div className={styles.anonymous_booking_form}>
                        <h2 className={styles.title}>
                          Informations de réservation
                        </h2>
                        <label htmlFor="fullName">
                          Nom complet :
                          <span
                            style={{
                              fontSize: "0.9em",
                              color: "#888",
                              marginLeft: 8,
                            }}
                          ></span>
                        </label>
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
                        <label htmlFor="email">
                          Email :
                          <span
                            style={{
                              fontSize: "0.9em",
                              color: "#888",
                              marginLeft: 8,
                            }}
                          ></span>
                        </label>
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
                        <label htmlFor="phoneNumber">
                          Téléphone :
                          <span
                            style={{
                              fontSize: "0.9em",
                              color: "#888",
                              marginLeft: 8,
                            }}
                          ></span>
                        </label>
                        <PhoneInput
                          international
                          defaultCountry="FR"
                          value={clientInfo.phoneNumber}
                          onChange={(value) =>
                            setClientInfo({
                              ...clientInfo,
                              phoneNumber: value || "",
                            })
                          }
                          id="phoneNumber"
                          name="phoneNumber"
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
                  </div>
                </div>
              </div>
            </li>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default ServiceList;

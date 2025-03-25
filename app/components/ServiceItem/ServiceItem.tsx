// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { format, formatISO, parseISO } from "date-fns";
// import { Service } from "@/types";
// import { useUser } from "@clerk/nextjs";
// import toast from "react-hot-toast";
// import Image from "next/image";
// import { createBooking } from "@/actions/bookings";
// import OptionManager from "../OptionManager/OptionManager";
// // Styles
// import styles from "./styles.module.scss";

// interface ServiceItemProps {
//   service: Service;
//   enableHover?: number;
//   remainingAmount: number;
// }

// const ServiceItem: React.FC<ServiceItemProps> = ({
//   service,
//   enableHover,
//   remainingAmount,
// }) => {
//   const { user } = useUser();
//   const [isBooking, setIsBooking] = useState(false);
//   const [bookingMessage, setBookingMessage] = useState<string | null>(null);
//   const [bookingId, setBookingId] = useState<string | null>(null);

//   const [startTime, setStartTime] = useState<string | null>(null);
//   const [endTime, setEndTime] = useState<string | null>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setStartTime(localStorage.getItem("startTime"));
//       setEndTime(localStorage.getItem("endTime"));
//     }
//   }, []);

//   // 🎯 Fonction de réservation
//   const handleBooking = useCallback(async () => {
//     if (!user) return toast.error("Vous devez être connecté pour réserver.");
//     if (!startTime || !endTime)
//       return toast.error("Veuillez sélectionner un horaire.");

//     const startISO = parseISO(startTime);
//     const endISO = parseISO(endTime);
//     if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
//       return toast.error("Les horaires sélectionnés sont invalides.");
//     }

//     setIsBooking(true);

//     try {
//       const booking = await createBooking(
//         user.id,
//         service.id,
//         formatISO(startISO),
//         startTime,
//         endTime
//       );
//       setBookingId(booking.id);

//       setBookingMessage(
//         `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
//       );
//       toast.success("Réservation réussie !");
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la réservation.");
//     } finally {
//       setIsBooking(false);
//     }
//   }, [user, service.id, startTime, endTime]);

//   // 🎨 Style conditionnel pour le hover
//   const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";
//   const imageUrl = service.imageUrl || "/assets/default.jpg";

//   return (
//     <li className={`${styles.service_item} ${hoverClass}`}>
//       <div className={styles.service_item__content}>
//         {/* 📷 Image du service */}
//         <div className={styles.service_image}>
//           <Image
//             src={imageUrl}
//             alt={service.name}
//             width={60}
//             height={60}
//             className={styles.__img}
//           />
//         </div>

//         {/* ℹ️ Détails du service */}
//         <div className={styles.service_item__details}>
//           <div className={styles.service_item__infos}>
//             <span className={styles.service_item__title}>{service.name}</span>
//             <span className={styles.service_item__description}>
//               {service.description
//                 ?.split("\n")
//                 .map((line, index) => <span key={index}>{line}</span>)}
//             </span>
//             <span className={styles.service_item__option_count}>
//               {service.options?.length} option(s)
//             </span>
//           </div>

//           {/* 💰 Montant */}
//           <div className={styles.service_item__stats}>
//             <span>
//               {new Intl.NumberFormat("fr-FR", {
//                 style: "currency",
//                 currency: "EUR",
//               }).format(remainingAmount)}
//             </span>
//           </div>

//           {/* 🎟️ Bouton de réservation */}
//           <button
//             disabled={isBooking}
//             onClick={handleBooking}
//             aria-label={
//               isBooking ? "Réservation en cours" : "Sélectionner ce service"
//             }
//           >
//             {isBooking ? "Sélection en cours..." : "Sélectionner"}
//           </button>
//         </div>
//       </div>

//       {/* 📩 Message de confirmation */}
//       {bookingMessage && (
//         <div className={styles.bookingConfirmationMessage}>
//           <p>{bookingMessage}</p>
//         </div>
//       )}

//       {/* ⚙️ Gestion des options après réservation */}
//       {bookingId && (
//         <div className={styles.service_item__option_reminder}>
//           <p>
//             Vous pouvez maintenant choisir des options supplémentaires pour
//             votre réservation.
//           </p>
//           <OptionManager
//             bookingId={bookingId}
//             serviceAmount={remainingAmount}
//             onTotalUpdate={() => {}}
//           />
//         </div>
//       )}
//     </li>
//   );
// };

// export default ServiceItem;
"usz client";

import { useState, useCallback, useEffect } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { Service } from "@/types";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Image from "next/image";
import { createBooking, generateBookingToken } from "@/actions/bookings";
import OptionManager from "../OptionManager/OptionManager";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";

interface ServiceItemProps {
  service: Service;
  enableHover?: number;
  remainingAmount: number;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  enableHover,
  remainingAmount,
}) => {
  const { user } = useUser();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStartTime(localStorage.getItem("startTime"));
      setEndTime(localStorage.getItem("endTime"));
    }
  }, []);

  // 🎯 Fonction de réservation
  // const handleBooking = useCallback(async () => {
  //   if (!user) return toast.error("Vous devez être connecté pour réserver.");
  //   if (!startTime || !endTime)
  //     return toast.error("Veuillez sélectionner un horaire.");

  //   const startISO = parseISO(startTime);
  //   const endISO = parseISO(endTime);
  //   if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
  //     return toast.error("Les horaires sélectionnés sont invalides.");
  //   }

  //   setIsBooking(true);

  //   try {
  //     const booking = await createBooking(
  //       user.id,
  //       service.id,
  //       formatISO(startISO),
  //       startTime,
  //       endTime
  //     );
  //     setBookingId(booking.id);
  //     setBookingMessage(
  //       `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
  //     );
  //     toast.success("Réservation réussie !");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Erreur lors de la réservation.");
  //   } finally {
  //     setIsBooking(false);
  //   }
  // }, [user, service.id, startTime, endTime]);
  const handleBooking = useCallback(async () => {
    if (!user) return toast.error("Vous devez être connecté pour réserver.");
    if (!startTime || !endTime)
      return toast.error("Veuillez sélectionner un horaire.");

    const startISO = parseISO(startTime);
    const endISO = parseISO(endTime);
    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      return toast.error("Les horaires sélectionnés sont invalides.");
    }

    setIsBooking(true);

    try {
      const booking = await createBooking(
        user.id,
        service.id,
        formatISO(startISO),
        startTime,
        endTime
      );

      setBookingId(booking.id);
      setBookingMessage(
        `✅ Réservé de ${format(startISO, "HH:mm")} à ${format(endISO, "HH:mm")}`
      );
      toast.success("Réservation réussie !");

      // ✅ 1. Générer un token pour sécuriser l'accès à la réservation
      const token = await generateBookingToken(booking.id, user.id);

      // ✅ 2. Rediriger directement avec le token dans l'URL
      router.push(`/manage-booking?token=${token}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation.");
    } finally {
      setIsBooking(false);
    }
  }, [user, service.id, startTime, endTime, router]);

  // 🎨 Style conditionnel
  const hoverClass = enableHover === 1 ? styles.hoverEnabled : "";
  const imageUrl = service.imageUrl || "/assets/default.jpg";

  return (
    <li className={`${styles.service_item} ${hoverClass}`}>
      <div className={styles.service_item__content}>
        {/* 📷 Image du service */}
        <div className={styles.service_image}>
          <Image
            src={imageUrl}
            alt={service.name}
            width={60}
            height={60}
            className={styles.__img}
          />
        </div>

        {/* ℹ️ Détails du service */}
        <div className={styles.service_item__details}>
          <div className={styles.service_item__infos}>
            <span className={styles.service_item__title}>{service.name}</span>
            <span className={styles.service_item__description}>
              {service.description
                ?.split("\n")
                .map((line, index) => <span key={index}>{line}</span>)}
            </span>
            <span className={styles.service_item__option_count}>
              {service.options?.length} option(s)
            </span>
          </div>

          {/* 💰 Montant */}
          <div className={styles.service_item__stats}>
            <span>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(remainingAmount)}
            </span>
          </div>

          {/* 🎟️ Bouton de réservation */}
          {!bookingId ? (
            <button
              disabled={isBooking}
              onClick={handleBooking}
              aria-label={
                isBooking ? "Réservation en cours" : "Réserver ce service"
              }
              className={isBooking ? styles.loading : ""}
            >
              {isBooking ? "Réservation en cours..." : "Réserver ce service"}
            </button>
          ) : (
            <button
              onClick={() => toast("Gestion des options bientôt disponible !")}
              className={styles.modifyButton}
            >
              Modifier ma réservation
            </button>
          )}
        </div>
      </div>

      {/* 📩 Message de confirmation */}
      {bookingMessage && (
        <div className={styles.bookingConfirmationMessage}>
          <p>{bookingMessage}</p>

          {/* ✅ Nouveau bouton pour gérer la réservation */}
          {bookingId && (
            <button
              className={styles.manageBookingButton}
              onClick={() => router.push(`/manage-booking/${bookingId}`)}
            >
              Gérer ma réservation
            </button>
          )}
        </div>
      )}

      {/* ⚙️ Gestion des options après réservation */}
      {bookingId && (
        <div className={styles.service_item__option_reminder}>
          <p>Ajoutez des options pour votre réservation :</p>
          <OptionManager
            bookingId={bookingId}
            serviceAmount={remainingAmount}
            onTotalUpdate={() => {}}
          />
        </div>
      )}
    </li>
  );
};

export default ServiceItem;

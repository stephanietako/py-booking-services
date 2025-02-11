// //app/manage-booking/[id]/page.tsx

// "use client";

// import React, { FC, useEffect, useState } from "react";
// import { deleteUserBooking, getUserBookings } from "@/actions/bookings";
// import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Service } from "@/types";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { Booking } from "@prisma/client";
// //import { FaRegTrashAlt } from "react-icons/fa";
// //Détails & gestion d’une réservation spécifique
// interface ManageBookingPageProps {
//   serviceId: string;
//   booking: Booking[];
// }
// const ManageBookingPage: FC<ManageBookingPageProps> = ({
//   serviceId,
// }: {
//   serviceId: string;
// }) => {
//   const { user } = useUser();
//   const [service, setService] = useState<Service | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [loading, setLoading] = useState<boolean>(false);
//   const router = useRouter();
//   const { id } = useParams(); // ID de la réservation récupéré depuis l'URL

//   useEffect(() => {
//     if (!user) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       return;
//     }

//     const fetchService = async () => {
//       if (user?.primaryEmailAddress?.emailAddress) {
//         setLoading(true);
//         try {
//           const bookings = await getUserBookings(
//             user.primaryEmailAddress.emailAddress
//           );
//           const bookedService = bookings.find(
//             (booking: Booking) => booking.serviceId === serviceId
//           );
//           if (bookedService) {
//             setService(bookedService.service);
//           } else {
//             setError("Service non trouvé dans vos réservations.");
//           }
//         } catch (error) {
//           console.error("Erreur lors du chargement de la réservation:", error);
//           setError("Impossible de récupérer la réservation.");
//         }
//       }
//     };

//     fetchService();
//   }, [serviceId, user]);

//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
//       try {
//         await deleteUserBooking(user.id);
//         router.push("/my-bookings");
//       } catch (error) {
//         console.error("Erreur lors de la suppression de la réservation", error);
//         setError("Impossible de supprimer la réservation.");
//       }
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="manage_booking">
//         {error ? (
//           <p className="error">{error}</p>
//         ) : service ? (
//           <div className="manage_booking_container">
//             {service && <ServiceItem service={service} enableHover={0} />}
//             <button onClick={handleDeleteBooking} className="btn_form">
//               Annuler la réservation
//             </button>
//           </div>
//         ) : (
//           <p>Chargement...</p>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default ManageBookingPage;
"use client";

import React, { FC, useEffect, useState } from "react";
import { deleteUserBooking, getUserBookings } from "@/actions/bookings";
import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { Service } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Booking } from "@prisma/client";
import toast from "react-hot-toast";
// Détails & gestion d’une réservation spécifique pour l'utilisateur avec la possibilité de l'annuler
const ManageBookingPage: FC = () => {
  const { user } = useUser();
  const { id } = useParams(); // Récupère l'ID de la réservation depuis l'URL
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleting, setDeleting] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setError("Vous devez être connecté pour voir cette réservation.");
      return;
    }

    // const fetchService = async () => {
    //   setLoading(true);
    //   try {
    //     const bookings = await getUserBookings(
    //       user.primaryEmailAddress?.emailAddress || ""
    //     );
    //     const bookedService = bookings.find(
    //       (booking: Booking) => booking.id === id // Utilise l'ID récupéré depuis l'URL
    //     );
    //     if (bookedService) {
    //       setService(bookedService.service);
    //     } else {
    //       setError("Service non trouvé dans vos réservations.");
    //     }
    //   } catch (error) {
    //     console.error("Erreur lors du chargement de la réservation:", error);
    //     setError("Impossible de récupérer la réservation.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    const fetchService = async () => {
      setLoading(true);
      try {
        const bookings = await getUserBookings(user.id); // Utilise `user.id` ici
        const bookedService = bookings.find(
          (booking: Booking) => booking.id === id // Utilise l'ID récupéré depuis l'URL
        );
        if (bookedService) {
          setService(bookedService.service);
        } else {
          setError("Service non trouvé dans vos réservations.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la réservation:", error);
        setError("Impossible de récupérer la réservation.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, user]); // Dépendance de `id` pour recharger la réservation si l'ID change

  //   const handleDeleteBooking = async () => {
  //     if (!user) {
  //       setError("Vous devez être connecté pour annuler cette réservation.");
  //       return;
  //     }

  //     if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
  //       try {
  //         await deleteUserBooking(id); // Utilise l'ID pour supprimer la réservation
  //         router.push("/my-bookings");
  //       } catch (error) {
  //         console.error("Erreur lors de la suppression de la réservation", error);
  //         setError("Impossible de supprimer la réservation.");
  //       }
  //     }
  //   };
  const handleDeleteBooking = async () => {
    if (!user) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    if (!id || Array.isArray(id)) {
      setError("ID de réservation invalide.");
      return; // Tu peux aussi rediriger vers une autre page si tu préfères
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment annuler cette réservation ?"
    );
    if (!confirmation) return;

    setDeleting(id);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(id); // Maintenant, tu sais que `id` est une chaîne
      router.push("/my-bookings");
      toast.success("Réservation annulée avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Wrapper>
      <div className="manage_booking">
        {error ? (
          <p className="error">{error}</p>
        ) : service ? (
          <div className="manage_booking_container">
            {service && <ServiceItem service={service} enableHover={0} />}
            <button onClick={handleDeleteBooking} className="btn_form">
              Annuler la réservation
            </button>
          </div>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </Wrapper>
  );
};

export default ManageBookingPage;
// La page ManageBookingPage est complémentaire à MyBookings et permet de gérer une réservation spécifique en montrant les détails du service et en offrant la possibilité d'annuler la réservation. Les deux pages fonctionnent ensemble pour créer une expérience utilisateur complète autour de la gestion des réservations.

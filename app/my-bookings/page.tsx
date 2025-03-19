// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Import du store Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);

//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions } = useBookingStore();

//   useEffect(() => {
//     if (!user) return;

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         // Mise à jour des montants dans Zustand
//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []); // Assurer la gestion des options
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user, setTotalAmount, setOptions]);

//   const handleTotalUpdate = useCallback(
//     (bookingId: string, total: number, updatedOptions: Option[]) => {
//       setTotalAmount(bookingId, total);
//       setOptions(bookingId, updatedOptions);

//       setBookings((prevBookings) =>
//         prevBookings.map((booking) =>
//           booking.id === bookingId
//             ? { ...booking, totalAmount: total, options: updatedOptions }
//             : booking
//         )
//       );
//     },
//     [setTotalAmount, setOptions]
//   );

//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     const confirmation = confirm(
//       "Voulez-vous vraiment annuler cette réservation ?"
//     );
//     if (!confirmation) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
////////////////////////////////////
// "use client";
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
// import { Booking, Option } from "@/types";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import Wrapper from "../components/Wrapper/Wrapper";
// import OptionManager from "../components/OptionManager/OptionManager";
// import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
// import { useBookingStore } from "@/store"; // Zustand

// const MyBookings = () => {
//   const { user } = useUser();
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null); // ✅ Réintégré pour la suppression
//   const router = useRouter();

//   const { totalAmounts, setTotalAmount, setOptions } = useBookingStore();

//   useEffect(() => {
//     if (!user?.id) return;

//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const data = await getUserBookings(user.id);
//         setBookings(data);

//         data.forEach((booking) => {
//           setTotalAmount(booking.id, booking.totalAmount);
//           setOptions(booking.id, booking.options || []);
//         });
//       } catch (error) {
//         console.error("Erreur lors du chargement des réservations :", error);
//         setError("Impossible de charger les réservations.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [user?.id, setTotalAmount, setOptions]);

//   const handleTotalUpdate = (
//     bookingId: string,
//     total: number,
//     updatedOptions: Option[]
//   ) => {
//     setTotalAmount(bookingId, total);
//     setOptions(bookingId, updatedOptions);
//     setBookings((prevBookings) =>
//       prevBookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, totalAmount: total, options: updatedOptions }
//           : booking
//       )
//     );
//   };

//   // ✅ Réintégré et utilisé `handleDeleteBooking`
//   const handleDeleteBooking = async (bookingId: string) => {
//     if (!user?.id) {
//       toast.error("Utilisateur non authentifié.");
//       return;
//     }

//     if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

//     setDeleting(bookingId);
//     const toastId = toast.loading("Annulation en cours...");

//     try {
//       await deleteUserBooking(bookingId, user.id);
//       setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
//       toast.success("Réservation annulée avec succès !", { id: toastId });
//     } catch (error) {
//       console.error("Erreur lors de l'annulation :", error);
//       toast.error("Impossible d'annuler la réservation.", { id: toastId });
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return (
//     <Wrapper>
//       <div className="booking">
//         <h1>Mes réservations</h1>

//         {loading && <p>Chargement en cours...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

//         {!loading && bookings.length > 0 && (
//           <ul className="booking_item">
//             {bookings.map((booking) => (
//               <li key={booking.id} className="booking_item__content">
//                 <ServiceCompt
//                   name={booking.service.name}
//                   description={
//                     booking.service.description ||
//                     "Aucune description disponible"
//                   }
//                   imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
//                   categories={booking.service.categories}
//                   startTime={booking.startTime}
//                   endTime={booking.endTime}
//                   options={booking.options || []}
//                   totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
//                 />
//                 <div className="booking_option">
//                   <OptionManager
//                     bookingId={booking.id}
//                     serviceAmount={
//                       totalAmounts[booking.id] ?? booking.totalAmount
//                     }
//                     onTotalUpdate={(total, updatedOptions) =>
//                       handleTotalUpdate(booking.id, total, updatedOptions)
//                     }
//                   />
//                   <span className="booking_option__btn">
//                     {/* ✅ Ajout du bouton pour supprimer la réservation */}
//                     <button
//                       onClick={() => handleDeleteBooking(booking.id)}
//                       disabled={deleting === booking.id}
//                     >
//                       {deleting === booking.id ? "Annulation..." : "Annuler"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         router.push(`/manage-booking/${booking.id}`)
//                       }
//                     >
//                       Voir la réservation
//                     </button>
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Wrapper>
//   );
// };

// export default MyBookings;
////////////////////////////////
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserBookings, deleteUserBooking } from "@/actions/bookings";
import { Booking, Option } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Wrapper from "../components/Wrapper/Wrapper";
import OptionManager from "../components/OptionManager/OptionManager";
import ServiceCompt from "../components/ServicesCompt/ServiceCompt";
import { useBookingStore } from "@/store"; // Zustand

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const { totalAmounts, setTotalAmount, setOptions, resetStore } =
    useBookingStore();

  useEffect(() => {
    if (!user?.id) return;

    // ✅ Réinitialiser Zustand avant de charger les nouvelles réservations
    resetStore();

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getUserBookings(user.id);
        setBookings(data);

        // ✅ Vérifier que les options ne sont pas dupliquées
        data.forEach((booking) => {
          setTotalAmount(booking.id, booking.totalAmount);
          setOptions(booking.id, booking.options || []);
        });
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
        setError("Impossible de charger les réservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, setTotalAmount, setOptions, resetStore]);

  const handleTotalUpdate = (
    bookingId: string,
    total: number,
    updatedOptions: Option[]
  ) => {
    setTotalAmount(bookingId, total);
    setOptions(bookingId, updatedOptions);
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, totalAmount: total, options: updatedOptions }
          : booking
      )
    );
  };

  // ✅ Ajout de la suppression de réservation avec toast et router
  const handleDeleteBooking = async (bookingId: string) => {
    if (!user?.id) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    setDeleting(bookingId);
    const toastId = toast.loading("Annulation en cours...");

    try {
      await deleteUserBooking(bookingId, user.id);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId)); // ✅ Suppression après succès
      toast.success("Réservation annulée avec succès !", { id: toastId });

      // ✅ Rediriger l'utilisateur vers une autre page après la suppression
      router.push("/my-bookings");
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      toast.error("Impossible d'annuler la réservation.", { id: toastId });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Wrapper>
      <div className="booking">
        <h1>Mes réservations</h1>

        {loading && <p>Chargement en cours...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && bookings.length === 0 && <p>Aucune réservation</p>}

        {!loading && bookings.length > 0 && (
          <ul className="booking_item">
            {bookings.map((booking) => (
              <li key={booking.id} className="booking_item__content">
                <ServiceCompt
                  name={booking.service.name}
                  description={
                    booking.service.description ||
                    "Aucune description disponible"
                  }
                  imageUrl={booking.service.imageUrl || "/assets/default.jpg"}
                  categories={booking.service.categories}
                  startTime={booking.startTime}
                  endTime={booking.endTime}
                  options={booking.options || []}
                  totalAmount={totalAmounts[booking.id] ?? booking.totalAmount}
                />
                <div className="booking_option">
                  <OptionManager
                    bookingId={booking.id}
                    serviceAmount={
                      totalAmounts[booking.id] ?? booking.totalAmount
                    }
                    onTotalUpdate={(total, updatedOptions) =>
                      handleTotalUpdate(booking.id, total, updatedOptions)
                    }
                  />
                  <span className="booking_option__btn">
                    {/* ✅ Ajout du bouton pour supprimer la réservation */}
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      disabled={deleting === booking.id}
                    >
                      {deleting === booking.id ? "Annulation..." : "Annuler"}
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/manage-booking/${booking.id}`)
                      }
                    >
                      Voir la réservation
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default MyBookings;

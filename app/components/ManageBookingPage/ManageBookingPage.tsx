// "use client";

// import React, { useEffect, useState } from "react";
// import { deleteUserBooking, getUserBookings } from "@/actions/bookings";
// import ServiceItem from "@/app/components/ServiceItem/ServiceItem";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// import { Service } from "@/types";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// //import { FaRegTrashAlt } from "react-icons/fa";

// const ManageBookingPage = ({ params }: { params: { serviceId: string } }) => {
//   const { user } = useUser();
//   const [service, setService] = useState<Service | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       setError("Vous devez être connecté pour voir cette réservation.");
//       return;
//     }

//     const fetchService = async () => {
//       try {
//         const bookings = await getUserBookings(user.id);
//         const bookedService = bookings.find(
//           (b) => b.service.id === params.serviceId
//         );
//         if (bookedService) {
//           setService(bookedService.service);
//         } else {
//           setError("Service non trouvé dans vos réservations.");
//         }
//       } catch (error) {
//         console.error("Erreur lors du chargement de la réservation:", error);
//         setError("Impossible de récupérer la réservation.");
//       }
//     };

//     fetchService();
//   }, [params.serviceId, user]);

//   const handleDeleteBooking = async () => {
//     if (!user) {
//       setError("Vous devez être connecté pour annuler cette réservation.");
//       return;
//     }

//     if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
//       try {
//         await deleteUserBooking(user.id, params.serviceId);
//         router.push("/bookings");
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
//             <ServiceItem service={service} enableHover={0} />
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
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Booking } from "@prisma/client";
//import { FaRegTrashAlt } from "react-icons/fa";

interface ManageBookingPageProps {
  serviceId: string;
  booking: Booking[];
}
const ManageBookingPage: FC<ManageBookingPageProps> = ({
  serviceId,
}: {
  serviceId: string;
}) => {
  const { user } = useUser();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setError("Vous devez être connecté pour voir cette réservation.");
      return;
    }

    const fetchService = async () => {
      if (user?.primaryEmailAddress?.emailAddress) {
        setLoading(true);
        try {
          const bookings = await getUserBookings(
            user.primaryEmailAddress.emailAddress
          );
          const bookedService = bookings.find(
            (booking: Booking) => booking.serviceId === serviceId
          );
          if (bookedService) {
            setService(bookedService.service);
          } else {
            setError("Service non trouvé dans vos réservations.");
          }
        } catch (error) {
          console.error("Erreur lors du chargement de la réservation:", error);
          setError("Impossible de récupérer la réservation.");
        }
      }
    };

    fetchService();
  }, [serviceId, user]);

  const handleDeleteBooking = async () => {
    if (!user) {
      setError("Vous devez être connecté pour annuler cette réservation.");
      return;
    }

    if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      try {
        await deleteUserBooking(user.id, serviceId);
        router.push("/bookings");
      } catch (error) {
        console.error("Erreur lors de la suppression de la réservation", error);
        setError("Impossible de supprimer la réservation.");
      }
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

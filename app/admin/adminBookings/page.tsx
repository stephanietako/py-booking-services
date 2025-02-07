// import { auth } from "@clerk/nextjs/server";
// import { getRole } from "@/actions/actions";
// import { getAllBookings } from "@/actions/bookings";
// import AdminBookingList from "@/app/components/AdminBookingList/AdminBookingList";
// import { redirect } from "next/navigation";

// const AdminBookings = async () => {
//   const { userId } = await auth();
//   if (!userId) {
//     redirect("/");
//     return null;
//   }

//   const userRole = await getRole(userId);
//   if (userRole?.role?.name !== "admin") {
//     redirect("/");
//     return null;
//   }

//   // Récupérer les réservations côté Server
//   const bookings = await getAllBookings();

//   return (
//     <div>
//       <h1>Gestion des Réservations</h1>
//       <AdminBookingList bookings={bookings} />
//       {/* Passer les réservations en props */}
//     </div>
//   );
// };

//  export default AdminBookings;
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import { getAllBookings } from "@/actions/bookings";
import AdminBookingList from "@/app/components/AdminBookingList/AdminBookingList";
import { redirect } from "next/navigation";

const AdminBookings = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
    return null;
  }

  const userRole = await getRole(userId);
  if (userRole?.role?.name !== "admin") {
    redirect("/");
    return null;
  }

  // Récupérer les réservations valides
  const bookings = await getAllBookings();

  return (
    <div>
      <h1>Gestion des Réservations</h1>
      <AdminBookingList bookings={bookings} />
    </div>
  );
};

export default AdminBookings;

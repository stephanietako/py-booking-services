// app/admin/bookings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import { getAllBookings } from "@/actions/bookings";
import { redirect } from "next/navigation";
import AdminBookingsUser from "@/app/components/AdminBookingsUser/AdminBookingsUser";

// On récupère les réservations de l'utilisateur

const AdminBookingsPage = async () => {
  const { userId } = await auth();

  // Vérification de l'authentification et du rôle de l'utilisateur
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
  const bookings = await getAllBookings(userId);

  return <AdminBookingsUser bookings={bookings} />;
};

export default AdminBookingsPage;

// import { auth } from "@clerk/nextjs/server";
// import { getRole } from "@/actions/actions";
// import { getAllBookings } from "@/actions/bookings";
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

//   // Récupérer les réservations valides
//   const bookings = await getAllBookings();

//   return (
//     <div>
//       <h1>Réservations en attente</h1>
//       <ul>
//         {bookings.map((res) => (
//           <li key={res.id}>Réservation ID: {res.id}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AdminBookings;

// app/admin/dashboard/adminBookings/page.tsx
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
// import React from "react";
// import { auth, redirect } from "next/navigation";
// import { getRole } from "@/actions/actions";
// import { getBookings } from "@/actions/bookings";

// import ListUser from "@/components/ListUser/ListUser";
// import Wrapper from "@/components/Wrapper/Wrapper";
// import { SignOutButton } from "@clerk/nextjs";
// import BookingList from "@/components/BookingList/BookingList";

// export default async function AdminDashboard() {
//   const { userId } = await auth();
//   if (!userId) redirect("/");

//   const userRole = await getRole(userId);
//   if (!userRole?.role?.name === "admin") {
//     redirect("/profile");
//   }

//   const initialBookings = await getBookings(undefined);

//   return (
//     <Wrapper>
//       <section>
//         <div className="dashboard_user_container__section">
//           <div className="dashboard_user_container__bloc">
//             <SignOutButton />
//           </div>
//           <div className="dashboard_user_container__content">
//             <ListUser />
//           </div>
//           <br />
//           <div>
//             <BookingList initialBookings={initialBookings} />
//           </div>
//         </div>
//       </section>
//     </Wrapper>
//   );
// }

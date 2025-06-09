// app/admin/dashboard/AdminBookings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import { getAllBookings } from "@/actions/bookings";
import { redirect } from "next/navigation";
import AdminBookingsPanel from "@/app/components/AdminBookingsPanel/AdminBookingsPanel";
import Wrapper from "@/app/components/Wrapper/Wrapper";

// Page strictement réservée à l'admin
const AdminBookingsPage = async () => {
  const { userId } = await auth();
  // Vérification de l'authentification
  if (!userId) {
    redirect("/");
    return null;
  }

  // Vérification du rôle admin
  const userRole = await getRole(userId);
  if (userRole?.name !== "admin") {
    redirect("/");
    return null;
  }

  // L'admin voit toutes les réservations
  const bookings = await getAllBookings(userId);

  return (
    <Wrapper>
      <AdminBookingsPanel bookings={bookings} />
    </Wrapper>
  );
};

export default AdminBookingsPage;

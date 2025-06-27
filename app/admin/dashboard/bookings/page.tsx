// app/admin/dashboard/bookings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import { getAllBookingsAdmin } from "@/actions/bookings";
import { redirect } from "next/navigation";
import AdminBookingsPanel from "@/app/components/AdminBookingsPanel/AdminBookingsPanel";
import Wrapper from "@/app/components/Wrapper/Wrapper";

const AdminBookingsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
    return null;
  }

  const userRole = await getRole(userId);
  if (userRole?.name !== "admin") {
    redirect("/");
    return null;
  }

  const bookings = await getAllBookingsAdmin();

  return (
    <Wrapper>
      <AdminBookingsPanel bookings={bookings} />
    </Wrapper>
  );
};

export default AdminBookingsPage;

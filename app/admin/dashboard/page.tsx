// app/admin/dashboard/page.tsx
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole } from "@/actions/actions";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { SignOutButton } from "@clerk/nextjs";
//import BookingList from "@/app/components/BookingList/BookingList";
import AdminUserClientList from "@/app/components/AdminUserClientList/AdminUserClientList";

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) redirect("/");

  const userRole = await getRole(userId);

  if (userRole?.name !== "admin") {
    redirect("/");
  }

  //const initialBookings = await getBookings(undefined);

  return (
    <Wrapper>
      <section>
        <div className="admin_dashboard_container">
          <div className="admin_dashboard_container__bloc">
            <SignOutButton />
          </div>
          <div className="admin_dashboard_container__content">
            <AdminUserClientList />
          </div>
          <br />
        </div>
      </section>
    </Wrapper>
  );
}

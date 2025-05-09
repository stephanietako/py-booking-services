// app/admin/dashbord/central-pannel/page.tsx
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRole } from "@/actions/actions";
import { getBookings } from "@/actions/bookings";

import ListUser from "@/app/components/ListUser/ListUser";
import Wrapper from "@/app/components/Wrapper/Wrapper";
import { SignOutButton } from "@clerk/nextjs";
import BookingList from "@/app/components/BookingList/BookingList";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userRole = await getRole(userId);
  if (userRole?.role?.name !== "admin") {
    redirect("/profile");
  }

  const initialBookings = await getBookings(undefined);

  return (
    <Wrapper>
      <section>
        <div className="dashboard_user_container__section">
          <div className="dashboard_user_container__bloc">
            <SignOutButton />
          </div>
          <div className="dashboard_user_container__content">
            <ListUser />
          </div>
          <br />
          <div>
            <BookingList initialBookings={initialBookings} />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}

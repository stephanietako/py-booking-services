import React, { Suspense } from "react";
import ManageBookingClient from "../components/ManageBookingClient/ManageBookingClient";

const ManageBookingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageBookingClient />
    </Suspense>
  );
};

export default ManageBookingPage;

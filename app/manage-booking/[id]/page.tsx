// //app/manage-booking/[id]/page.tsx

// "use client";

// import React, { FC, useEffect } from "react";
// import { getBookingById } from "@/actions/bookings";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";

// const ManageBookingIdPage: FC = () => {
//   const { user, isSignedIn, isLoaded } = useUser();
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn) {
//       router.replace("/");
//       return;
//     }

//     const fetchToken = async () => {
//       try {
//         const { token } = await getBookingById(id, user.id);
//         if (token) {
//           router.replace(`/manage-booking?token=${token}`);
//         } else {
//           console.error("Une erreur s'est produite : Token non trouvé");
//         }
//       } catch (error) {
//         console.error("Une erreur s'est produite :", error);
//       }
//     };

//     fetchToken();
//   }, [id, user, isSignedIn, isLoaded, router]);

//   return <p>Redirection...</p>;
// };

// export default ManageBookingIdPage;
import React from "react";

const ManageBookingIdPage = () => {
  return <div>Manage Booking Page en maintenance</div>;
};

export default ManageBookingIdPage;

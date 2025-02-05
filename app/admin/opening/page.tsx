// "use client";

// import { FC, useState } from "react";
// import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
// import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
// import Wrapper from "@/app/components/Wrapper/Wrapper";
// export const dynamic = "force-dynamic";

// type OpeningProps = {
//   userId: string;
// };
// const Opening: FC<OpeningProps> = () => {
//   const [enabled, setEnabled] = useState(false);

//   return (
//     <Wrapper>
//       <div className="admin-container">
//         <h2>Administration : Horaires et Jours Fermés</h2>
//         <div className="switch-container">
//           <button
//             className={`switch-btn ${!enabled ? "active" : ""}`}
//             onClick={() => setEnabled(false)}
//           >
//             Gérer les horaires
//           </button>
//           <button
//             className={`switch-btn ${enabled ? "active" : ""}`}
//             onClick={() => setEnabled(true)}
//           >
//             Gérer les jours fermés
//           </button>
//         </div>

//         {!enabled ? <ManageOpeningHours /> : <ClosedDays />}
//       </div>
//     </Wrapper>
//   );
// };

// export default Opening;
// app/admin/opening/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/actions/actions";
import Opening from "@/app/components/Opening/Opening";
export const dynamic = "force-dynamic";

const OpeningPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
    return null; // Rediriger si l'utilisateur n'est pas authentifié
  }

  const userRole = await getRole(userId);

  if (userRole?.role?.name !== "admin") {
    redirect("/");
    return null; // Rediriger si l'utilisateur n'est pas un admin
  }

  return (
    <div>
      <Opening />
    </div>
  );
};

export default OpeningPage;

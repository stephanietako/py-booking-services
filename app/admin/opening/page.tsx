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
// "use client";

// import { FC, useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getRole } from "@/actions/actions"; // Assurez-vous que cette fonction est correcte
// import ManageOpeningHours from "@/app/components/ManageOpeningHours/ManageOpeningHours";
// import ClosedDays from "@/app/components/ClosedDays/ClosedDays";
// import Wrapper from "@/app/components/Wrapper/Wrapper";

// export const dynamic = "force-dynamic";

// type OpeningProps = {
//   userId: string;
// };

// const Opening: FC<OpeningProps> = ({ userId }) => {
//   const [enabled, setEnabled] = useState(false);
//   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const checkAdmin = async () => {
//       try {
//         const user = await getRole(userId);
//         if (user?.role?.name !== "admin") {
//           router.push("/");
//         } else {
//           setIsAdmin(true);
//         }
//       } catch (error) {
//         console.error("Erreur lors de la vérification du rôle :", error);
//         router.push("/"); // Redirection en cas d'erreur
//       }
//     };

//     checkAdmin();
//   }, [userId, router]);

//   if (isAdmin === null) {
//     return <p>Vérification en cours...</p>; // ⏳ Indicateur de chargement
//   }

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
import { redirect } from "next/navigation";
import { getRole } from "@/actions/actions";
import { auth } from "@clerk/nextjs/server";
import Opening from "@/app/components/Opening/Opening";

const OpeningPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
    return null;
  }

  // Récupère le rôle de l'utilisateur directement depuis la base de données après l'ajout
  const userRole = await getRole(userId);

  if (userRole?.role?.name !== "admin") {
    redirect("/");
    return null; // Assurez-vous de retourner null après la redirection
  }
  return (
    <div>
      <Opening />
    </div>
  );
};

export default OpeningPage;

// "use server";

// import prisma from "@/lib/prisma";

// export async function checkAdmin(
//   email: string,
//   clerkUserId: string,
//   provider: string,
//   password?: string
// ) {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   const adminPassword = process.env.ADMIN_PASSWORD;

//   // Vérification de l'email et du rôle admin
//   if (email === adminEmail) {
//     if (provider === "google" || password === adminPassword) {
//       // Recherche de l'utilisateur avec clerkUserId
//       const existingUser = await prisma.user.findUnique({
//         where: { clerkUserId },
//       });

//       if (existingUser) {
//         // Mise à jour de l'utilisateur existant en tant qu'admin
//         const user = await prisma.user.update({
//           where: { clerkUserId },
//           data: { isAdmin: true },
//         });
//         console.log("Utilisateur mis à jour", user);
//         return { isAdmin: true };
//       } else {
//         console.log("Utilisateur non trouvé, création...");

//         // Créer un nouvel admin avec tous les champs requis
//         await prisma.user.create({
//           data: {
//             clerkUserId,
//             email,
//             name: "Admin",
//             isAdmin: true,
//             createdAt: new Date(),
//             role: {
//               connect: {
//                 name: "admin", // Assure-toi que le rôle "admin" existe dans ta table Role
//               },
//             },
//           },
//         });
//         return { isAdmin: true, message: "Nouvel administrateur créé" };
//       }
//     } else {
//       return { isAdmin: false, message: "Mot de passe incorrect" };
//     }
//   } else {
//     return { isAdmin: false, message: "Email non autorisé" };
//   }
// }

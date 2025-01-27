// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   await prisma.role.upsert({
//     where: { name: "member" },
//     update: {},
//     create: { name: "member" },
//   });
//   await prisma.role.upsert({
//     where: { name: "admin" },
//     update: {},
//     create: { name: "admin" },
//   });
// }

// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
////////////////
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Insertion des rôles
  await prisma.role.upsert({
    where: { name: "member" },
    update: {},
    create: { name: "member" },
  });

  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  // Insertion des jours de la semaine
  const daysOfWeek = [
    { dayOfWeek: 0, name: "sunday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 1, name: "monday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 2, name: "tuesday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 3, name: "wednesday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 4, name: "thursday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 5, name: "friday", openTime: "08:00", closeTime: "20:00" },
    { dayOfWeek: 6, name: "saturday", openTime: "08:00", closeTime: "20:00" },
  ];

  for (const day of daysOfWeek) {
    await prisma.day.upsert({
      where: { id: `day-${day.dayOfWeek}` }, // Utilisez une clé unique basée sur votre modèle Prisma
      update: {}, // Aucun changement à mettre à jour
      create: day, // Créez les données si elles n'existent pas
    });
  }

  console.log("Seeding completed: Roles and Days inserted or updated.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

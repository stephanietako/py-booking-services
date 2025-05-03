import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ✅ Insertion des rôles
  await Promise.all([
    prisma.role.upsert({
      where: { name: "member" },
      update: {},
      create: { name: "member" },
    }),
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
  ]);

  // ✅ Insertion des jours de la semaine
  const daysOfWeek = [
    { dayOfWeek: 0, name: "sunday" },
    { dayOfWeek: 1, name: "monday" },
    { dayOfWeek: 2, name: "tuesday" },
    { dayOfWeek: 3, name: "wednesday" },
    { dayOfWeek: 4, name: "thursday" },
    { dayOfWeek: 5, name: "friday" },
    { dayOfWeek: 6, name: "saturday" },
  ];

  await Promise.all(
    daysOfWeek.map((day) =>
      prisma.day.upsert({
        where: { dayOfWeek: day.dayOfWeek },
        update: {},
        create: {
          name: day.name,
          dayOfWeek: day.dayOfWeek,
          openTime: "09:00",
          closeTime: "18:00",
        },
      })
    )
  );

  console.log("✅ Roles and Days seeded");

  // ✅ Création du service principal
  await prisma.service.upsert({
    where: { name: "Service" },
    update: {},
    create: {
      name: "Service",
      description: "Formule service unique (repas non compris)...",
      defaultPrice: 1500,
      isFixed: true,
      amount: 1500,
      price: 1500,
      currency: "EUR",
      categories: ["Location bateau"],
      imageUrl: "/assets/logo/logo-full.png",
    },
  });

  console.log("✅ Service principal inséré");

  // ✅ Insertion des règles de tarification dynamiques
  const service = await prisma.service.findUnique({
    where: { name: "Service" },
  });
  if (!service) throw new Error("❌ Service introuvable");

  const startYear = 2024;
  const endYear = 2030;

  const pricingRules = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  ).flatMap((year) => [
    {
      serviceId: service.id,
      startDate: new Date(`${year}-10-16`),
      endDate: new Date(`${year + 1}-05-31`),
      price: 1500,
    },
    {
      serviceId: service.id,
      startDate: new Date(`${year + 1}-06-01`),
      endDate: new Date(`${year + 1}-07-07`),
      price: 1700,
    },
    {
      serviceId: service.id,
      startDate: new Date(`${year + 1}-07-08`),
      endDate: new Date(`${year + 1}-08-31`),
      price: 1900,
    },
    {
      serviceId: service.id,
      startDate: new Date(`${year + 1}-09-01`),
      endDate: new Date(`${year + 1}-10-15`),
      price: 1700,
    },
  ]);

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: {
        serviceId_startDate_endDate: {
          serviceId: rule.serviceId,
          startDate: rule.startDate,
          endDate: rule.endDate,
        },
      },
      update: {},
      create: rule,
    });
  }

  console.log("✅ Tarifs dynamiques insérés jusqu'à 2030");
  console.log("🎉 Seeding terminé avec succès");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

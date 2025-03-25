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
      where: { dayOfWeek: day.dayOfWeek }, // Correction ici
      update: {},
      create: day,
    });
  }

  console.log("✅ Seeding completed: Roles and Days inserted or updated.");

  // Création des services fixes "Simplicité" et "Premium"
  await prisma.service.upsert({
    where: { name: "Simplicité" }, // Maintenant, ça fonctionne !
    update: {},
    create: {
      name: "Simplicité",
      description: "Formule simplicité (repas non compris)...",
      defaultPrice: 1500,
      isFixed: true,
      amount: 1500,
      price: 1500,
      currency: "EUR",
      categories: ["Simplicité"],
      imageUrl: "/assets/default.jpg",
    },
  });

  await prisma.service.upsert({
    where: { name: "Premium" },
    update: {},
    create: {
      name: "Premium",
      description: "Formule Premium avec repas à bord...",
      defaultPrice: 1500,
      isFixed: true,
      amount: 1500,
      price: 1500,
      currency: "EUR",
      categories: ["Premium"],
      imageUrl: "/assets/default.jpg",
    },
  });

  console.log("✅ Services fixes insérés.");

  // Récupérer les IDs des services fixes
  const simplicite = await prisma.service.findFirst({
    where: { name: "Simplicité" },
  });
  const premium = await prisma.service.findFirst({
    where: { name: "Premium" },
  });

  if (!simplicite || !premium) {
    console.error("❌ Erreur : Impossible de récupérer les services fixes.");
    process.exit(1); // STOP le script si une erreur se produit
  }

  // Récupération de tous les services
  const services = await prisma.service.findMany();
  if (services.length === 0) {
    console.error("❌ Erreur : Aucun service trouvé !");
    process.exit(1);
  }

  // Insertion des tarifs dynamiques pour plusieurs années
  const startYear = 2024;
  const endYear = 2030; // Générer les tarifs jusqu'à 2030

  const pricingRules = services.flatMap((service) =>
    Array.from(
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
    ])
  );

  await prisma.pricingRule.createMany({ data: pricingRules });

  console.log("✅ Tarifs dynamiques insérés jusqu'à 2030.");
  console.log("🎉 Seeding terminé avec succès !");
}

// Exécution du script
main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

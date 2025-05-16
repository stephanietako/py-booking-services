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
      description:
        "Seul, en couple ou jusqu’à 10 personnes, profitez simplement du bateau et d’un capitaine à votre disposition pour aller ou bon vous semble et vous faire débarquer dans le restaurant de votre choix. Vous préférez chiller à bord en dégustant votre panier-repas, n’hésitez pas à ramener ce que bon vous semble. Un frigidaire sera à votre disposition pour conserver vos sandwich, charcuterie, fromage, vins ou autres. ",
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

  await prisma.option.createMany({
    data: [
      {
        label: "6 Paires de masques et tubas adultes et 2 paires enfants",
        name: "masques-tubas",
        unitPrice: 0,
        amount: 0,
        payableOnline: false,
        payableAtBoard: false,
      },
      {
        label: "1 Paddle board inclus",
        name: "paddle-inclus",
        unitPrice: 0,
        amount: 0,
        payableOnline: false,
        payableAtBoard: false,
      },
      {
        label: "Literie et serviettes de douche",
        name: "literie-serviettes",
        unitPrice: 0,
        amount: 0,
        payableOnline: false,
        payableAtBoard: false,
      },
      {
        label: "Eau plate",
        name: "eau-plate",
        unitPrice: 0,
        amount: 0,
        payableOnline: false,
        payableAtBoard: false,
      },
      {
        label: "Repas à bord",
        name: "repas-a-bord",
        unitPrice: 0, // Prix variable, sera défini ailleurs
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Boissons : Eau pétillante, Coca, Ice tea",
        name: "boissons",
        unitPrice: 40,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Bouteille de vin Blanc ou Rosé",
        name: "vin-blanc-rose",
        unitPrice: 25,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Bouteille de champagne",
        name: "champagne",
        unitPrice: 50,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Paddle board supplémentaire",
        name: "paddle-supplementaire",
        unitPrice: 50,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Serviette de bain",
        name: "serviette-bain",
        unitPrice: 5,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
      {
        label: "Caution",
        name: "caution",
        unitPrice: 4000,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

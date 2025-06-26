import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ✅ Insertion des rôles
  await Promise.all([
    prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: { name: "user" },
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

  // ✅ Création ou mise à jour du service principal
  await prisma.pricingRule.deleteMany({
    where: {
      service: { name: "Service" },
    },
  });

  await prisma.service.deleteMany({
    where: { name: "Service" },
  });

  await prisma.service.upsert({
    where: { name: "Évasion en mer – Cap Camarat 12.5" },
    update: {
      description:
        "Seul, en couple ou jusqu'à 10 personnes, profitez simplement du bateau et d'un capitaine à votre disposition pour aller où bon vous semble et vous faire débarquer dans le restaurant de votre choix. Vous préférez chiller à bord en dégustant votre panier-repas, n'hésitez pas à ramener ce que bon vous semble. Un frigidaire sera à votre disposition pour conserver vos sandwich, charcuterie, fromage, vins ou autres. **Inclus : 6 paires de masques et tubas adultes, 2 paires enfants, 1 paddle board, literie et serviettes de douche, eau plate.**\n\n**Caution de 4000 € à régler sur place.**",
      cautionAmount: 4000,
      requiresCaptain: true,
    },
    create: {
      name: "Évasion en mer – Cap Camarat 12.5",
      description: `Seul, en couple ou jusqu'à 10 personnes, profitez simplement du bateau et d'un capitaine à votre disposition pour aller où bon vous semble et vous faire débarquer dans le restaurant de votre choix.

Vous préférez chiller à bord en dégustant votre panier-repas, n'hésitez pas à ramener ce que bon vous semble. Un frigidaire sera à votre disposition pour conserver vos sandwichs, charcuterie, fromage, vins ou autres.

**Inclus : 6 paires de masques et tubas adultes, 2 paires enfants, 1 paddle board, literie et serviettes de douche, eau plate.**

**Caution de 4000 € à régler sur place (CB ou espèce, montant non débité)**`,

      defaultPrice: 1500,
      isFixed: true,
      amount: 1500,
      price: 1500,
      currency: "EUR",
      categories: ["Location bateau"],
      imageUrl: "/assets/logo/hippo-transp.png",
      cautionAmount: 4000,
      requiresCaptain: true,
    },
  });

  console.log(
    "✅ Service principal inséré et description mise à jour, caution "
  );

  // ✅ Insertion des règles de tarification dynamiques (2025-2030)
  const service = await prisma.service.findUnique({
    where: { name: "Évasion en mer – Cap Camarat 12.5" },
  });
  if (!service) throw new Error("❌ Service introuvable");

  // 🔧 CORRECTION : Années 2025 à 2030
  const startYear = 2025;
  const endYear = 2030;

  const pricingRules = [];
  for (let year = startYear; year <= endYear; year++) {
    // BASSE SAISON : 16 Octobre N au 31 Mai N+1 = 1500€
    pricingRules.push({
      serviceId: service.id,
      startDate: new Date(`${year}-10-16`),
      endDate: new Date(`${year + 1}-05-31`),
      price: 1500,
    });

    // MOYENNE SAISON : 1er Juin au 7 Juillet N = 1700€
    pricingRules.push({
      serviceId: service.id,
      startDate: new Date(`${year}-06-01`),
      endDate: new Date(`${year}-07-07`),
      price: 1700,
    });

    // HAUTE SAISON : 8 Juillet au 31 Août N = 1900€
    pricingRules.push({
      serviceId: service.id,
      startDate: new Date(`${year}-07-08`),
      endDate: new Date(`${year}-08-31`),
      price: 1900,
    });

    // MOYENNE SAISON : 1er Septembre au 15 Octobre N = 1700€
    pricingRules.push({
      serviceId: service.id,
      startDate: new Date(`${year}-09-01`),
      endDate: new Date(`${year}-10-15`),
      price: 1700,
    });
  }

  await Promise.all(
    pricingRules.map((rule) =>
      prisma.pricingRule.upsert({
        where: {
          serviceId_startDate_endDate: {
            serviceId: rule.serviceId,
            startDate: rule.startDate,
            endDate: rule.endDate,
          },
        },
        update: {},
        create: rule,
      })
    )
  );

  console.log("✅ Tarifs dynamiques insérés de 2025 à 2030");

  // ✅ Insertion des options avec upsert
  await Promise.all([
    prisma.option.upsert({
      where: { name: "boissons" },
      update: {},
      create: {
        label: "Boissons : Eau pétillante, Coca, Ice tea",
        name: "boissons",
        unitPrice: 40,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    }),
    prisma.option.upsert({
      where: { name: "vin-blanc-rose" },
      update: {},
      create: {
        label: "Bouteille de vin Blanc ou Rosé",
        name: "vin-blanc-rose",
        unitPrice: 25,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    }),
    prisma.option.upsert({
      where: { name: "champagne" },
      update: {},
      create: {
        label: "Bouteille de champagne",
        name: "champagne",
        unitPrice: 50,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    }),
    prisma.option.upsert({
      where: { name: "paddle-supplementaire" },
      update: {},
      create: {
        label: "Paddle board supplémentaire",
        name: "paddle-supplementaire",
        unitPrice: 50,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    }),
    prisma.option.upsert({
      where: { name: "serviette-bain" },
      update: {},
      create: {
        label: "Serviette de bain",
        name: "serviette-bain",
        unitPrice: 5,
        amount: 0,
        payableOnline: false,
        payableAtBoard: true,
      },
    }),
  ]);

  console.log("✅ Options insérées ou mises à jour");
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

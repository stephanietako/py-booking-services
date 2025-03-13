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

  // ✅ Création des services fixes "Simplicité" et "Premium"
  await prisma.service.upsert({
    where: { id: "simplicite-service-id" }, // ✅ ID unique forcé
    update: {},
    create: {
      id: "simplicite-service-id",
      name: "Simplicité",
      description: `
      Formule découverte (repas non compris)  
      Eau inclus  
      
      Seul, en couple ou jusqu’à 10 personnes, profitez simplement du bateau et d’un capitaine à votre disposition pour aller où bon vous semble et vous faire débarquer dans le restaurant de votre choix.  
      Vous préférez chiller à bord en dégustant votre panier-repas ? N’hésitez pas à ramener ce que bon vous semble. Un frigidaire sera à votre disposition pour conserver vos sandwichs, charcuterie, fromage, vins ou autres.  
      
      **Formule simplicité (coût additionnel de 50 Euros/pers.)**  
      - Apéritif et repas « sandwich »  
      - 1 bouteille de Rosé  
      - Eau et soda inclus  
      
      Profitez au maximum de votre temps à bord du bateau en toute simplicité. Venez les mains dans les poches, appréciez un bon apéritif, le fameux sandwich du capitaine et passez la journée de vos rêves !
    `,
      defaultPrice: 1700,
      isFixed: true,
      amount: 1700,
      price: 1700,
      currency: "EUR",
      categories: ["Simplicité"],
      imageUrl: "/assets/default.jpg",
    },
  });

  await prisma.service.upsert({
    where: { id: "premium-service-id" }, // ✅ ID unique forcé
    update: {},
    create: {
      id: "premium-service-id",
      name: "Premium",
      description: `
      **Apéritif et repas « service à table »**  
      - 1 bouteille de Rosé  
      - 1 bouteille de Champagne  
      - Eau et Soda à volonté  
      
      Décidez de votre menu au moment de votre réservation et comptez sur votre capitaine pour mettre en assiette les délices de notre traiteur local favori.  
      Seul, en couple, entre amis ou en famille, sachez apprécier un moment d’exception à sa juste valeur !  
      
      **Inclus dans votre location** :  
      - 6 Paires de masques et tubas adultes et 2 paires enfants  
      - 1 paddle board  
      - 1 Serviette de bain/pers.  
      - Literie et serviettes de douche  
      - Eau en bouteille  
    `,
      defaultPrice: 2500,
      isFixed: true,
      amount: 2500,
      price: 2500,
      currency: "EUR",
      categories: ["Premium"],
      imageUrl: "/assets/default.jpg",
    },
  });

  console.log("✅ Services fixes insérés.");

  // 🔥 Récupérer les IDs des services fixes
  const simplicite = await prisma.service.findFirst({
    where: { name: "Simplicité" },
  });

  const premium = await prisma.service.findFirst({
    where: { name: "Premium" },
  });

  if (!simplicite || !premium) {
    console.error("❌ Erreur : Impossible de récupérer les services fixes.");
    return;
  }

  // ✅ Insérer les tarifs dynamiques
  await prisma.pricingRule.createMany({
    data: [
      {
        serviceId: simplicite.id,
        startDate: new Date("2024-10-16"),
        endDate: new Date("2025-05-31"),
        price: 1500,
      },
      {
        serviceId: simplicite.id,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-07"),
        price: 1700,
      },
      {
        serviceId: simplicite.id,
        startDate: new Date("2025-07-08"),
        endDate: new Date("2025-08-31"),
        price: 1900,
      },
      {
        serviceId: premium.id,
        startDate: new Date("2024-10-16"),
        endDate: new Date("2025-05-31"),
        price: 2000,
      },
      {
        serviceId: premium.id,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-07"),
        price: 2200,
      },
      {
        serviceId: premium.id,
        startDate: new Date("2025-07-08"),
        endDate: new Date("2025-08-31"),
        price: 2500,
      },
    ],
  });

  console.log("✅ Tarifs dynamiques insérés.");
  console.log("🎉 Seeding terminé !");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

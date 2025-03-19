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
      where: { id: `day-${day.dayOfWeek}` },
      update: {},
      create: day,
    });
  }

  console.log("Seeding completed: Roles and Days inserted or updated.");

  // Création des services fixes "Simplicité" et "Premium"
  await prisma.service.upsert({
    where: { id: "simplicite-service-id" },
    update: {},
    create: {
      id: "simplicite-service-id",
      name: "Simplicité",
      description: `Formule simplicité (repas non compris)\n
- Eau inclus\n
- Seul, en couple ou jusqu’à 10 personnes, profitez simplement du bateau et d’un capitaine à votre disposition pour aller où bon vous semble et vous faire débarquer dans le restaurant de votre choix.\n
- Vous préférez chiller à bord en dégustant votre panier-repas, n’hésitez pas à ramener ce que bon vous semble. Un frigidaire sera à votre disposition pour conserver vos sandwichs, charcuterie, fromages, vins ou autres.\n`,
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
    where: { id: "premium-service-id" },
    update: {},
    create: {
      id: "premium-service-id",
      name: "Premium",
      description: `Formule Premium (Coût additionnel, contactez-nous pour plus de renseignements)\n
- Apéritif et repas à bord\n
- 1 bouteille de Rosé\n
- Eau et Soda à volonté\n
- Décidez de votre menu au moment de votre réservation et comptez sur votre capitaine pour mettre en assiette les délices de notre traiteur local préféré.\n
- Inclus dans votre location :\n
  - 6 Paires de masques et tubas adultes et 2 paires enfants\n
  - 1 paddle board\n
  - 1 Serviette de bain/personne\n
  - Literie et serviettes de douche\n
  - Eau en bouteille\n
- En Options :\n
  - Vins, champagnes et boissons spéciales (contactez-nous pour plus de renseignements)\n
  - Hôtesse : 200€/jour (sous réserve de disponibilité)\n
  - Location Paddle board supplémentaires : 50€/jour`,
      defaultPrice: 1500,
      isFixed: true,
      amount: 1500,
      price: 1500,
      currency: "EUR",
      categories: ["Premium"],
      imageUrl: "/assets/default.jpg",
    },
  });

  console.log("Services fixes insérés.");

  // Récupérer les IDs des services fixes
  const simplicite = await prisma.service.findFirst({
    where: { name: "Simplicité" },
  });

  const premium = await prisma.service.findFirst({
    where: { name: "Premium" },
  });

  if (!simplicite || !premium) {
    console.error("Erreur : Impossible de récupérer les services fixes.");
    return;
  }

  const services = await prisma.service.findMany();
  if (services.length === 0) {
    console.error(
      "Erreur : Aucun service trouvé, assurez-vous d'avoir inséré les services avant d'exécuter ce seed."
    );
    return;
  }

  // Insérer les tarifs dynamiques pour plusieurs années
  const pricingRules = [];
  const startYear = 2024;
  const endYear = 2030; // Générer les tarifs jusqu'à 2030

  for (let year = startYear; year <= endYear; year++) {
    for (const service of services) {
      pricingRules.push(
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
        }
      );
    }
  }

  await prisma.pricingRule.createMany({ data: pricingRules });

  console.log("Tarifs dynamiques insérés pour toutes les années jusqu'à 2030.");
  console.log("Seeding terminé !");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

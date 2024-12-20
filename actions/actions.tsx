"use server";

import prisma from "@/app/lib/prisma";

// Va nous permettre de vérifier si un user existe déjà dans la BD sinon on l'ajoute
export async function checkAndAddUser(email: string | undefined) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
        },
      });
      console.log("Nouvel utilisateur ajouté dans la base de données");
    } else {
      console.log("Utilisateur déjà présent dans la base de données");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
  }
}

// Ajouter les services
export async function addService(email: string, name: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    await prisma.service.create({
      data: {
        name,
        amount,
        userId: user.id,
      },
    });
    console.log("Service ajouté avec succès");
  } catch (error) {
    console.error("Erreur lors de l'ajout du service:", error);
    throw error;
  }
}

// Afficher les services
export async function getServicesByUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        services: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    // On va retourner la liste de tous les services
    return user.services;
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error);
    throw error;
  }
}

// Récupérer la liste des transactions d'un service
export async function getTransactionsByServiceId(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        transactions: true,
      },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    return service;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    throw error;
  }
}

// Ajouter une nouvelle transaction à un service
export async function addTransactionToService(
  serviceId: string,
  amount: number,
  description: string
) {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        transactions: true,
      },
    });
    if (!service) {
      throw new Error("Service non trouvé");
    }

    const totalTransactions = service.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // La transaction ne doit pas dépasser le montant du service
    const totalWithNewTransaction = totalTransactions + amount;
    if (totalWithNewTransaction > service.amount) {
      throw new Error(
        "Le montant total des transactions dépasse le montant du service"
      );
    }

    // Si le montant n'est pas supérieur, on crée la nouvelle transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        service: {
          connect: {
            id: service.id,
          },
        },
      },
    });

    console.log("Transaction ajoutée avec succès");
    return newTransaction;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction", error);
    throw error;
  }
}

// fonction qui sert à suppimer un service et ses transactions
export const deleteService = async (serviceId: string) => {
  try {
    // plusieurs
    await prisma.transaction.deleteMany({
      where: { serviceId },
    });
    // un seul
    await prisma.service.delete({
      where: {
        id: serviceId,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppréssion du service et de ses transactions associées",
      error
    );
    throw error;
  }
};

// supprimer une transaction
export async function deleteTransaction(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      throw new Error("Transaction non trouvées");
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppréssion de la transaction ", error);
    throw error;
  }
}

// liste des transactions
export async function getTransactionsByEmailAndPeriod(
  email: string,
  period: string
) {
  try {
    // obtient la date et l'heure actuelles
    const now = new Date();
    let dateLimit;

    switch (period) {
      case "last30":
        // pour les 30 derniers jours
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 30);
        break;
      case "last90":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 90);
        break;
      case "last7":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 7);
        break;
      case "last365":
        // pour les 365 derniers jours (1 an)
        dateLimit = new Date(now);
        dateLimit.setDate(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide");
    }

    // récupérer l'utilisateur par email avec ses services et les transactions de ces services
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        services: {
          include: {
            transactions: {
              where: {
                createdAt: {
                  // filtre les transactions créées après la date limite déterminée
                  // gte c'est greater
                  gte: dateLimit,
                },
              },
              // trie les transactions par date de création de la plus récente à la plus ancienne
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // rassembler toutes les transactions à partir des services en incluant le nom du service sans avoir à chq fois à renvoyer tous les services
    const transactions = user.services.flatMap((service) =>
      service.transactions.map((transaction) => ({
        ...transaction,
        serviceName: service.name,
        serviceId: service.id,
      }))
    );

    return transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions ", error);
    throw error;
  }
}

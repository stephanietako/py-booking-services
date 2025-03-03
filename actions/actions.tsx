"use server";

import { prisma } from "@/lib/prisma";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import mime from "mime";

// Récupérer un utilisateur par son clerkUserId
export async function getRole(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { role: true },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return user;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du rôle de l'utilisateur",
      error
    );
    throw error;
  }
}

// Ajouter un utilisateur à la base de données
export async function addUserToDatabase(
  email: string,
  name: string,
  image: string,
  clerkUserId: string
) {
  try {
    // Recherche uniquement par clerkUserId pour éviter les doublons
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Si l'utilisateur existe déjà, on met à jour ses informations
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { clerkUserId },
        data: {
          email,
          name,
          image,
        },
      });
      return updatedUser;
    }

    // Vérifie l'existence du rôle avant création
    const role = await prisma.role.findUnique({
      where: { name: "member" },
    });
    if (!role) {
      throw new Error("Le rôle spécifié n'existe pas.");
    }

    // Crée l'utilisateur seulement si clerkUserId n'existe pas
    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        image,
        roleId: role.id,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur à la base :", error);
    throw error;
  }
}

// Récupérer les services associés à un utilisateur
export async function getServicesByUser(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { bookings: { include: { service: true } } },
    });
    if (!user) throw new Error("Utilisateur non trouvé");
    return user.bookings.map((booking) => booking.service);
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error);
    throw error;
  }
}

// Récupérer un service par son ID
export async function getServiceById(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    return service; // Retourne le service avec la description
  } catch (error) {
    console.error("Erreur lors de la récupération du service:", error);
    throw error;
  }
}

// Récupérer la liste des transactions associées à un service
export async function getTransactionsByServiceId(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        transactions: true,
      },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    return service.transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    throw error;
  }
}

// Ajouter une transaction à un service
export async function addTransactionToService(
  serviceId: string,
  amount: number,
  description: string
) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        serviceId,
      },
    });

    console.log("Transaction ajoutée avec succès:", transaction);
    return transaction;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction:", error);
    throw error;
  }
}

// Supprimer un service et ses transactions
export async function deleteService(serviceId: string) {
  try {
    await prisma.transaction.deleteMany({ where: { serviceId } });
    await prisma.service.delete({ where: { id: serviceId } });
    console.log("Service supprimé avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error);
    throw error;
  }
}

// Supprimer une transaction
export async function deleteTransaction(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      throw new Error("Transaction non trouvée");
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la transaction:", error);
    throw error;
  }
}

// Récupérer les transactions d'un utilisateur par période
export async function getTransactionsByEmailAndPeriod(
  clerkUserId: string,
  period: string
) {
  try {
    const now = new Date();
    let dateLimit;

    switch (period) {
      case "last30":
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
        dateLimit = new Date(now);
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        bookings: {
          include: {
            service: {
              include: {
                transactions: {
                  where: {
                    createdAt: {
                      gte: dateLimit,
                    },
                  },
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const transactions = user.bookings.flatMap((booking) =>
      booking.service.transactions.map((transaction) => ({
        ...transaction,
        serviceName: booking.service.name,
        serviceId: booking.service.id,
      }))
    );

    return transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions", error);
    throw error;
  }
}

// Récupérer les services associés à un utilisateur
export const getLastServices = async (clerkUserId: string) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        bookings: {
          some: {
            userId: clerkUserId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        transactions: true,
      },
    });

    return services;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des derniers services",
      error
    );
    throw error;
  }
};

// Créer un service
export async function createService(
  name: string,
  amount: number,
  description: string,
  file: File,
  categories: string[]
) {
  try {
    if (!name || !amount || !file) {
      throw new Error("Les informations nécessaires sont manquantes.");
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error("Format d'image non pris en charge");
    }

    // Envoi de l'image sur le serveur
    const imageUrl = await uploadImageToServer(file);
    console.log("URL de l'image téléchargée :", imageUrl);
    // Création du service
    const newService = await prisma.service.create({
      data: {
        name,
        amount,
        description,
        imageUrl,
        categories: categories.length > 0 ? categories : ["defaultCategory"], // Utilisation des catégories passées en paramètre
        active: true, // L'état actif du service, tu peux ajuster selon ton besoin
      },
    });

    console.log("Service créé avec succès");
    return newService;
  } catch (error) {
    console.error("Erreur lors de la création du service", error);
    throw error; // Relancer l'erreur pour que l'appelant puisse gérer l'erreur
  }
}

//////////
// Récupérer les services atteints par un utilisateur (exemple: services ayant plus de 5 transactions)
export async function getReachedServices(
  clerkUserId: string,
  transactionThreshold: number = 5
) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        bookings: {
          include: {
            service: {
              include: {
                transactions: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Filtre les services dont le nombre de transactions dépasse le seuil
    const reachedServices = user.bookings
      .map((booking) => booking.service)
      .filter((service) => service.transactions.length >= transactionThreshold);

    return reachedServices;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des services atteints:",
      error
    );
    throw error;
  }
}

// Calculer le montant total des transactions d'un utilisateur dans une période donnée
export async function getTotalTransactionAmount(
  clerkUserId: string,
  period: string
) {
  try {
    const now = new Date();
    let dateLimit;

    switch (period) {
      case "last30":
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
        dateLimit = new Date(now);
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        bookings: {
          include: {
            service: {
              include: {
                transactions: {
                  where: {
                    createdAt: {
                      gte: dateLimit,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calcule le montant total des transactions
    const totalAmount = user.bookings.reduce((total, booking) => {
      const serviceTotal = booking.service.transactions.reduce(
        (amountTotal, transaction) => amountTotal + transaction.amount,
        0
      );
      return total + serviceTotal;
    }, 0);

    return totalAmount;
  } catch (error) {
    console.error(
      "Erreur lors du calcul du montant total des transactions:",
      error
    );
    throw error;
  }
}

// Calculer le nombre total de transactions d'un utilisateur dans une période donnée
export async function getTotalTransactionCount(
  clerkUserId: string,
  period: string
) {
  try {
    const now = new Date();
    let dateLimit;

    switch (period) {
      case "last30":
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
        dateLimit = new Date(now);
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide");
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        bookings: {
          include: {
            service: {
              include: {
                transactions: {
                  where: {
                    createdAt: {
                      gte: dateLimit,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calcule le nombre total de transactions
    const totalCount = user.bookings.reduce((count, booking) => {
      return count + booking.service.transactions.length;
    }, 0);

    return totalCount;
  } catch (error) {
    console.error(
      "Erreur lors du calcul du nombre total des transactions:",
      error
    );
    throw error;
  }
}

// // Récupérer tous les services
export const getAllServices = async () => {
  try {
    // Récupère tous les services sans filtrer par email
    const services = await prisma.service.findMany({
      include: {
        transactions: true, // Inclure les transactions associées si nécessaire
      },
    });

    return services; // Retourne la liste de tous les services
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de tous les services:",
      error
    );
    throw error; // Lève l'erreur pour qu'elle soit gérée ailleurs
  }
};

export async function updateService(
  serviceId: string,
  name: string,
  amount: number,
  description: string,
  file?: File,
  categories?: string[]
) {
  try {
    // Récupération du service existant
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    // Vérification du fichier d'image si présent
    let imageUrl = service.imageUrl; // Conserver l'URL de l'image existante
    if (file) {
      // Si un fichier est fourni, on télécharge une nouvelle image
      imageUrl = await uploadImageToServer(file);
    }

    // Mise à jour du service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        amount,
        description,
        imageUrl,
        categories: categories || service.categories, // Si des catégories sont passées, on les met à jour, sinon on garde celles existantes
      },
    });

    console.log("Service mis à jour avec succès :", updatedService);
    return updatedService;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error);
    throw new Error("Impossible de mettre à jour le service");
  }
}

// Fonction pour uploader une image
async function uploadImageToServer(file: File): Promise<string> {
  console.log("📂 Début de l'upload...");

  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("✅ Buffer créé");

  const relativeUploadDir = `/uploads/${
    new Date().toISOString().split("T")[0]
  }`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);
  console.log("📁 Dossier d'upload:", uploadDir);

  try {
    await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }));
    console.log("📂 Dossier créé (ou existant)");

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = mime.getExtension(file.type) || "png";
    const fileName = `${uniqueSuffix}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    console.log("✅ Image enregistrée :", filePath);

    return `${relativeUploadDir}/${fileName}`;
  } catch (error) {
    console.error("❌ Erreur lors du téléchargement de l'image:", error);
    throw new Error("Erreur lors de l'upload de l'image");
  }
}

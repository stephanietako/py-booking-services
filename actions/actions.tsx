"use server";

import prisma from "@/lib/prisma";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import mime from "mime";

// Ajouter un utilisateur à la base de données
export async function addUserToDatabase(
  email: string,
  name: string,
  image: string,
  clerkUserId: string
) {
  try {
    // Vérifie si le rôle existe bien dans la base de données
    const role = await prisma.role.findUnique({
      where: { name: "member" }, // Assure-toi que le nom "member" existe dans la table Role
    });

    if (!role) {
      throw new Error("Le rôle spécifié n'existe pas.");
    }

    // Utilise `upsert` pour créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        name,
        image,
      },
      create: {
        clerkUserId,
        email,
        name,
        image,
        roleId: role.id,
      },
    });

    // console.log("Utilisateur ajouté ou mis à jour :", user);
    return user;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur à la base :", error);
    throw error;
  }
}
// export async function addUserToDatabase(
//   email: string,
//   name: string,
//   clerkUserId: string,
//   description?: string
// ) {
//   try {
//     // Vérification si l'utilisateur existe déjà avec le même email
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       // Gérer le cas où l'utilisateur existe déjà
//       console.log("L'utilisateur existe déjà avec cet email.");
//       // Option 1 : Mettre à jour l'utilisateur
//       const updatedUser = await prisma.user.update({
//         where: { email },
//         data: { name, description: description ?? undefined },
//       });
//       return updatedUser;
//     } else {
//       // Utilisation de `upsert` pour créer un utilisateur
//       const role = await prisma.role.findUnique({
//         where: { name: "member" },
//       });

//       if (!role) {
//         throw new Error("Le rôle spécifié n'existe pas.");
//       }

//       const user = await prisma.user.upsert({
//         where: { clerkUserId },
//         update: {
//           name,
//           description: description ?? undefined,
//         },
//         create: {
//           clerkUserId,
//           email,
//           name,
//           description: description ?? undefined,
//           roleId: role.id,
//         },
//       });

//       return user;
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(
//         "Erreur lors de l'ajout de l'utilisateur à la base :",
//         error.message
//       );
//     } else {
//       console.error(
//         "Erreur inconnue lors de l'ajout de l'utilisateur à la base :",
//         error
//       );
//     }
//     throw error; // Relance l'erreur pour gestion ultérieure
//   }
// }

// Récupérer un utilisateur par son email
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

export async function checkAndAddUser(
  email: string | undefined,
  name: string,
  clerkUserId: string,
  role: string
) {
  if (!email || !name || !role) return;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      await addUserToDatabase(email, name, role, clerkUserId);
    } else {
      console.log("Utilisateur déjà présent dans la base de données");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
  }
}

// Ajouter un service
export async function addService(
  email: string,
  name: string,
  amount: number,
  description: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Utilisateur non trouvé");

    await prisma.service.create({
      data: {
        name,
        amount,
        description,
        imageUrl: "",
        userId: user.id,
      },
    });
    console.log("Service ajouté avec succès");
  } catch (error) {
    console.error("Erreur lors de l'ajout du service:", error);
    throw error;
  }
}

// Récupérer les services d'un utilisateur
export async function getServicesByUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { services: { include: { transactions: true } } },
    });
    if (!user) throw new Error("Utilisateur non trouvé");
    return user.services;
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
// Ajouter une transaction à un service
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

    // Mettre à jour le montant du service en ajoutant le montant de l'option
    await prisma.service.update({
      where: {
        id: service.id,
      },
      data: {
        amount: service.amount + amount,
      },
    });

    console.log("Transaction ajoutée avec succès");
    return newTransaction;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction", error);
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
// Fonction pour supprimer un service et ses transactions
// export const deleteService = async ({
//   imagePath,
//   id,
// }: {
//   imagePath: string;
//   id: string;
// }) => {
//   try {
//     // Suppression de l'image si nécessaire
//     await deleteImageFromStorage(imagePath);

//     // Suppression des transactions associées au service
//     await prisma.transaction.deleteMany({
//       where: { serviceId: id },
//     });

//     // Suppression du service de la base de données
//     await prisma.service.delete({
//       where: {
//         id: id,
//       },
//     });

//     console.log("Service supprimé avec succès");
//   } catch (error) {
//     console.error("Erreur lors de la suppression du service:", error);
//     throw error;
//   }
// };
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
        dateLimit.setFullYear(now.getFullYear() - 1);
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

// dashboard /////////////////////
// Calculer le montant total des transactions sans limitation de budget
export async function getTotalTransactionAmount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        services: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    const totalAmount = user.services
      .flatMap(
        (service: { transactions: { amount: number }[] }) =>
          service.transactions
      )
      .reduce(
        (sum: number, transaction: { amount: number }) =>
          sum + transaction.amount,
        0
      );

    return totalAmount;
  } catch (error) {
    console.error(
      "Erreur lors du calcul du montant total des transactions:",
      error
    );
    throw error;
  }
}

// comptage des transactions
export async function getTotalTransactionCount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        services: {
          include: {
            transactions: true,
          },
        },
      },
    });
    if (!user) throw new Error("Utilisateur non trouvés");

    const totalCount = user.services.reduce((count, service) => {
      return count + service.transactions.length;
    }, 0);

    return totalCount;
  } catch (error) {
    console.error("Erreur lors du comptage des transactions:", error);
    throw error;
  }
}

export async function getReachedServices(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        services: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) throw new Error("Utilisateur non trouvés");

    const totalServices = user.services.length;
    const reachedServices = user.services.filter((service) => {
      const totalTransactionsAmount = service.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return totalTransactionsAmount >= service.amount;
    }).length;

    return `${reachedServices}/${totalServices}`;
  } catch (error) {
    console.error("Erreur du calcul des services atteints:", error);
    throw error;
  }
}

////////////////
// Récupérer les 3 derniers services
export const getLastServices = async (email: string) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        user: {
          email,
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
      "Erreur lors de la récupération des derniers services: ",
      error
    );
    throw error;
  }
};

// Récupérer tous les services
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

// Récupérer tous les services par utilisateur
export const getAllServicesByUser = async (email: string) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        user: {
          email,
        },
      },
      include: {
        transactions: true,
      },
    });
    return services;
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error);
    return { error: "Impossible de récupérer les services." };
  }
};

///////////////////////////////////////////

//CREATION SERVICE & UPDATE SERVICE
// Mettre à jour un service
export async function updateService(
  serviceId: string,
  name: string,
  amount: number,
  description: string,
  file?: File
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    // Vérification du fichier si présent
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
        imageUrl, // On met à jour l'URL de l'image si nécessaire
      },
    });

    console.log("Service mis à jour avec succès :", updatedService);
    return updatedService;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error);
    throw new Error("Impossible de mettre à jour le service");
  }
}

// Créer un service avec upload d'image
export async function createService(
  email: string,
  name: string,
  amount: number,
  description: string,
  file: File
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérification du format du fichier
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error("Format d'image non pris en charge");
    }

    // Upload de l'image et récupération de l'URL
    const imageUrl = await uploadImageToServer(file);

    // Création du service
    const newService = await prisma.service.create({
      data: {
        name,
        amount,
        description,
        userId: user.id,
        imageUrl, // On attribue l'URL de l'image
      },
    });

    console.log("Service créé avec succès :", newService);
    return newService;
  } catch (error) {
    console.error("Erreur lors de la création du service:", error);
    throw new Error("Impossible de créer le service");
  }
}

// Fonction pour uploader une image
async function uploadImageToServer(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeUploadDir = `/uploads/${
    new Date().toISOString().split("T")[0]
  }`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }));
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = mime.getExtension(file.type) || "png";
    const fileName = `${uniqueSuffix}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    return `${relativeUploadDir}/${fileName}`;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw new Error("Erreur lors de l'upload de l'image");
  }
}

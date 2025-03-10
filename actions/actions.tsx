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
    console.error("❌ Erreur lors de la récupération du service.");
    throw error;
  }
}

// Récupérer la liste des options associées à un service
export async function getOptionsByServiceId(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        options: true,
      },
    });

    if (!service) {
      throw new Error("Service non trouvé");
    }

    return service.options;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des options.");
    throw error;
  }
}

// Ajouter une option à un service
export async function addOptionToService(
  serviceId: string,
  amount: number,
  description: string
) {
  try {
    const option = await prisma.option.create({
      data: {
        amount,
        description,
        serviceId,
      },
    });

    console.log(`✅ Option ajoutée avec succès (ID: ${option.id}).`);

    return option;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la option:", error);
    throw error;
  }
}

// Supprimer un service et ses options
export async function deleteService(serviceId: string) {
  try {
    await prisma.option.deleteMany({ where: { serviceId } });
    await prisma.service.delete({ where: { id: serviceId } });
    console.log(`✅ Service supprimé (ID: ${serviceId}).`);
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error);
    throw error;
  }
}

// Supprimer une option
export async function deleteManyoption(optionId: string) {
  try {
    const option = await prisma.option.findUnique({
      where: {
        id: optionId,
      },
    });

    if (!option) {
      console.log(` Option déjà supprimée ou introuvable (ID: ${optionId}).`);
      return;
    }
    await prisma.option.delete({ where: { id: optionId } });
    console.log(`✅ Option supprimée (ID: ${optionId}).`);

    // if (!option) {
    //   throw new Error("Option non trouvée");
    // }

    // await prisma.option.delete({
    //   where: {
    //     id: optionId,
    //   },
    // });
  } catch (error) {
    console.error("Erreur lors de la suppression de la option:");
    throw error;
  }
}

// Récupérer les options d'un utilisateur par période
export async function getOptionsByEmailAndPeriod(
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
                options: {
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

    const options = user.bookings.flatMap((booking) =>
      booking.service.options.map((option) => ({
        ...option,
        serviceName: booking.service.name,
        serviceId: booking.service.id,
      }))
    );

    return options;
  } catch (error) {
    console.error("Erreur lors de la récupération des options", error);
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
        options: true,
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

    // Création du service
    const newService = await prisma.service.create({
      data: {
        name,
        amount,
        description,
        imageUrl,
        categories: categories.length > 0 ? categories : ["defaultCategory"], // Utilisation des catégories passées en paramètre
        active: true, // L'état actif du service, tu peux ajuster selon ton besoin
        price: amount, // Ajout de la propriété price
        currency: "EUR", // Ajout de la propriété currency, ajustez selon votre besoin
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
// Récupérer les services atteints par un utilisateur (exemple: services ayant plus de 5 options)
export async function getReachedServices(
  clerkUserId: string,
  optionThreshold: number = 5
) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        bookings: {
          include: {
            service: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Filtre les services dont le nombre d' options dépasse le seuil
    const reachedServices = user.bookings
      .map((booking) => booking.service)
      .filter((service) => service.options.length >= optionThreshold);

    return reachedServices;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des services atteints:",
      error
    );
    throw error;
  }
}

// Calculer le montant total des optionss d'un utilisateur dans une période donnée
export async function getTotalOptionAmount(
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
                options: {
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

    // Calcule le montant total des options
    const totalAmount = user.bookings.reduce((total, booking) => {
      const serviceTotal = booking.service.options.reduce(
        (amountTotal, option) => amountTotal + option.amount,
        0
      );
      return total + serviceTotal;
    }, 0);

    return totalAmount;
  } catch (error) {
    console.error("Erreur lors du calcul du montant total des options:", error);
    throw error;
  }
}

// Calculer le nombre total d'options d'un utilisateur dans une période donnée
export async function getTotalOptionCount(clerkUserId: string, period: string) {
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
                options: {
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

    // Calcule le nombre total d' options
    const totalCount = user.bookings.reduce((count, booking) => {
      return count + booking.service.options.length;
    }, 0);

    return totalCount;
  } catch (error) {
    console.error("Erreur lors du calcul du nombre total des options:", error);
    throw error;
  }
}

// Récupérer tous les services
export const getAllServices = async () => {
  try {
    // Récupère tous les services sans filtrer par email
    const services = await prisma.service.findMany({
      include: {
        options: true, // Inclure les options associées si nécessaire
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

//
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

    console.log(
      "✅ Service mis à jour avec succès (ID: " + updatedService.id + ")."
    );
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
  console.log("✅ Image uploadée avec succès.");

  try {
    await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }));
    console.log("📂 Dossier créé (ou existant)");

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = mime.getExtension(file.type) || "png";
    const fileName = `${uniqueSuffix}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    console.log("✅ Image uploadée avec succès.");

    return `${relativeUploadDir}/${fileName}`;
  } catch {
    console.error("❌ Erreur lors du téléchargement de l'image.");
    throw new Error("Erreur lors de l'upload de l'image");
  }
}

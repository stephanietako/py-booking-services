"use server";

import { prisma } from "@/lib/prisma";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import mime from "mime";
import { Option, Service } from "@/types";
import { auth } from "@clerk/nextjs/server";
//import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
const priceCache = new Map<string, number>();

////////ADMIN//////////
const ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((email) =>
    email.trim().toLowerCase()
  ) || [];

// Fonction pour vérifier si un email est admin
export async function isAdminEmail(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Fonction pour récupérer le rôle d'un utilisateur
export async function getRole(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { role: true },
    });
    return user?.role || null;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du rôle:", error);
    return null;
  }
}

// Fonction pour vérifier si l'utilisateur actuel est admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const role = await getRole(userId);
    return role?.name === "admin";
  } catch (error) {
    console.error("❌ Erreur lors de la vérification admin:", error);
    return false;
  }
}

// Fonction améliorée pour ajouter un utilisateur à la base de données
export async function addUserToDatabase(
  email: string,
  name: string,
  imageUrl: string,
  clerkUserId: string,
  phoneNumber: string = ""
) {
  const normalizedEmail = email.toLowerCase().trim();

  // ✅ Correction: Attendre la promesse
  const isAdmin = await isAdminEmail(normalizedEmail);

  console.log("🎯 addUserToDatabase appelée avec:", {
    email: normalizedEmail,
    name,
    clerkUserId,
    phoneNumber,
    isAdmin, // ✅ Maintenant c'est un boolean
  });

  try {
    // Récupérer ou créer les rôles
    const [userRole, adminRole] = await Promise.all([
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

    // Déterminer le rôle
    const roleId = isAdmin ? adminRole.id : userRole.id;
    const roleName = isAdmin ? "admin" : "user";

    console.log(`🔧 Attribution du rôle: ${roleName} pour ${normalizedEmail}`);

    // ✅ Vérifier les conflits d'email (cohérence avec webhook)
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmailUser && existingEmailUser.clerkUserId !== clerkUserId) {
      console.log("⚠️ CONFLIT: Email existe avec un autre clerkUserId");
      console.log("🔄 Mise à jour avec le nouveau clerkUserId...");

      const updatedUser = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          clerkUserId,
          name,
          image: imageUrl,
          phoneNumber,
          roleId,
          updatedAt: new Date(),
        },
        include: { role: true },
      });

      console.log("✅ Utilisateur mis à jour (conflit résolu):", {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role.name,
      });

      return updatedUser;
    }

    // Upsert normal si pas de conflit
    const result = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email: normalizedEmail,
        name,
        image: imageUrl,
        phoneNumber,
        roleId,
        updatedAt: new Date(),
      },
      create: {
        email: normalizedEmail,
        name,
        image: imageUrl,
        clerkUserId,
        phoneNumber,
        roleId,
      },
      include: {
        role: true,
      },
    });

    console.log("✅ Utilisateur créé/mis à jour:", {
      id: result.id,
      email: result.email,
      role: result.role.name,
      isAdmin: result.role.name === "admin",
    });

    return result;
  } catch (error) {
    console.error("❌ Erreur dans addUserToDatabase:", error);
    throw error;
  }
}
// Fonction pour promouvoir un utilisateur en admin
export async function promoteUserToAdmin(userId: string) {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error(
        "❌ Accès refusé: seuls les administrateurs peuvent promouvoir des utilisateurs"
      );
    }

    // Récupérer le rôle admin
    const adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!adminRole) {
      throw new Error("❌ Rôle administrateur introuvable");
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: adminRole.id },
      include: { role: true },
    });

    console.log("✅ Utilisateur promu administrateur:", updatedUser.email);
    revalidatePath("/admin");

    return updatedUser;
  } catch (error) {
    console.error("❌ Erreur lors de la promotion:", error);
    throw error;
  }
}

// Fonction pour rétrograder un admin en utilisateur
export async function demoteAdminToUser(userId: string) {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error(
        "❌ Accès refusé: seuls les administrateurs peuvent rétrograder des utilisateurs"
      );
    }

    // Récupérer le rôle user
    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      throw new Error("❌ Rôle utilisateur introuvable");
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: userRole.id },
      include: { role: true },
    });

    console.log(
      "✅ Administrateur rétrogradé en utilisateur:",
      updatedUser.email
    );
    revalidatePath("/admin");

    return updatedUser;
  } catch (error) {
    console.error("❌ Erreur lors de la rétrogradation:", error);
    throw error;
  }
}

// Fonction pour lister tous les utilisateurs (admin seulement)
// export async function getAllUsers() {
//   try {
//     const isAdmin = await isCurrentUserAdmin();
//     if (!isAdmin) {
//       throw new Error(
//         "❌ Accès refusé: seuls les administrateurs peuvent voir la liste des utilisateurs"
//       );
//     }

//     const users = await prisma.user.findMany({
//       include: {
//         role: true,
//         bookings: {
//           select: {
//             id: true,
//             createdAt: true,
//             status: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return users.map((user) => ({
//       ...user,
//       bookingsCount: user.bookings.length,
//       lastBooking: user.bookings[0]?.createdAt || null,
//     }));
//   } catch (error) {
//     console.error("❌ Erreur lors de la récupération des utilisateurs:", error);
//     throw error;
//   }
// }
export async function getAllUsers(page = 1, limit = 10) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error(
        "❌ Accès refusé: seuls les administrateurs peuvent voir la liste des utilisateurs"
      );
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true,
          bookings: {
            select: {
              id: true,
              createdAt: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    const usersWithComputed = users.map((user) => ({
      ...user,
      bookingsCount: user.bookings.length,
      lastBooking: user.bookings[0]?.createdAt || null,
    }));

    return {
      users: usersWithComputed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}
// Fonction pour récupérer tous les clients (admin seulement)
// export async function getAllClients() {
//   try {
//     const isAdmin = await isCurrentUserAdmin();
//     if (!isAdmin) {
//       throw new Error("Accès refusé : admin uniquement");
//     }
//     const clients = await prisma.client.findMany({
//       include: {
//         bookings: {
//           select: {
//             id: true,
//             createdAt: true,
//             status: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     return clients.map((client) => ({
//       ...client,
//       bookingsCount: client.bookings.length,
//       lastBooking: client.bookings[0]?.createdAt || null,
//     }));
//   } catch (error) {
//     console.error("Erreur lors de la récupération des clients:", error);
//     throw error;
//   }
// }
export async function getAllClients(page = 1, limit = 10) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error("Accès refusé : admin uniquement");
    }
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        skip,
        take: limit,
        include: {
          bookings: {
            select: {
              id: true,
              createdAt: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count(),
    ]);

    const clientsWithComputed = clients.map((client) => ({
      ...client,
      bookingsCount: client.bookings.length,
      lastBooking: client.bookings[0]?.createdAt || null,
    }));

    return {
      clients: clientsWithComputed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    throw error;
  }
}
// Fonction pour vérifier et synchroniser les rôles administrateurs
export async function syncAdminRoles() {
  try {
    console.log("🔄 Synchronisation des rôles administrateurs...");

    // Récupérer le rôle admin
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    });

    // Récupérer tous les utilisateurs avec des emails admin
    const usersToPromote = await prisma.user.findMany({
      where: {
        email: {
          in: ADMIN_EMAILS.map((email) => email.toLowerCase()),
        },
        roleId: {
          not: adminRole.id,
        },
      },
    });

    if (usersToPromote.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: usersToPromote.map((user) => user.id),
          },
        },
        data: {
          roleId: adminRole.id,
        },
      });

      console.log(
        `✅ ${usersToPromote.length} utilisateur(s) promu(s) administrateur(s)`
      );
    }

    return {
      success: true,
      promotedCount: usersToPromote.length,
      adminEmails: ADMIN_EMAILS,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    throw error;
  }
}
// Fonction pour récupérer un service par son ID
export async function getServiceById(
  serviceId: string
): Promise<Service | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    return service;
  } catch (error) {
    console.error("Erreur lors de la récupération du service :", error);
    return null;
  }
}

// Fonction pour récupérer les services d'un utilisateur
export async function getServicesByUser(
  clerkUserId: string
): Promise<Service[]> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      bookings: {
        include: {
          service: true,
        },
      },
    },
  });
  if (!user) throw new Error("Utilisateur non trouvé");
  return user.bookings
    .map((booking) => {
      const service = booking.service!;
      return {
        ...service,
        description: service.description ?? undefined,
      };
    })
    .filter(Boolean);
}

// Fonction pour récupérer les options
export async function getOptions() {
  const options = await prisma.option.findMany();

  if (!options.length) throw new Error("Aucune option trouvée");
  return options;
}

// Fonction pour récupérer les options d'un service
export async function addOptionToService(
  amount: number,
  unitPrice: number,
  description: string
): Promise<Option> {
  const createdOption = await prisma.option.create({
    data: {
      amount,
      unitPrice,
      name: description,
      label: description,
    },
  });

  return {
    ...createdOption,
    description,
  };
}

// Fonction pour récupérer les options d'un service
export async function deleteService(serviceId: string) {
  await prisma.service.delete({ where: { id: serviceId } });
}

// Fonction pour supprimer une option
export async function deleteOptionWithDependencies(optionId: string) {
  const option = await prisma.option.findUnique({ where: { id: optionId } });
  if (!option) {
    throw new Error("Option introuvable.");
  }

  const bookingCount = await prisma.bookingOption.count({
    where: { optionId },
  });

  if (bookingCount > 0) {
    throw new Error(
      "Impossible de supprimer l’option : elle est utilisée dans une ou plusieurs réservations."
    );
  }

  await prisma.option.delete({ where: { id: optionId } });
}

// Fonction pour récupérer un service par son ID
export async function getAllServices(): Promise<Service[]> {
  const services = await prisma.service.findMany();
  return services.map((service) => ({
    ...service,
    description: service.description ?? undefined,
  }));
}

// Fonction pour récupérer un service par son ID
export async function updateService(
  serviceId: string,
  name: string,
  amount: number,
  description: string,
  file?: File,
  categories?: string[]
) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Service non trouvé");

  let imageUrl = service.imageUrl;
  if (file) imageUrl = await uploadImageToServer(file);

  return await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      amount,
      description,
      imageUrl,
      categories: categories || service.categories,
    },
  });
}

// Fonction pour uploader une image sur le serveur
async function uploadImageToServer(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeUploadDir = `/uploads/${new Date().toISOString().split("T")[0]}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }));

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileExtension = mime.getExtension(file.type) || "png";
  const fileName = `${uniqueSuffix}.${fileExtension}`;
  const filePath = join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `${relativeUploadDir}/${fileName}`;
}

// Fonction pour récupérer le prix dynamique d'un service
export async function getDynamicPrice(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const cacheKey = `${serviceId}-${startDate}-${endDate}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey)!;

  const rule = await prisma.pricingRule.findFirst({
    where: {
      serviceId,
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
    },
  });
  const price = rule ? rule.price : 1500;
  priceCache.set(cacheKey, price);
  return price;
}

// Fonction pour récupérer le service d'un utilisateur
export async function getServiceForUser(
  clerkUserId: string
): Promise<Service | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      bookings: {
        where: { serviceId: { not: null } },
        include: { service: true },
      },
    },
  });

  if (!user || user.bookings.length === 0) return null;

  // Comme il n'y a qu'un service, on retourne juste le service du premier booking
  const service = user.bookings[0].service!;
  return {
    ...service,
    description: service.description ?? undefined,
  };
}

// Fonction pour récupérer les options d'un service
export async function updateOptionQuantity(
  bookingOptionId: string,
  newQuantity: number
) {
  if (newQuantity < 0) throw new Error("La quantité doit être positive.");

  return await prisma.$transaction(async (tx) => {
    const bookingOption = await tx.bookingOption.findUnique({
      where: { id: bookingOptionId },
      include: { option: true },
    });
    if (!bookingOption) throw new Error("Option non trouvée.");

    const oldQuantity = bookingOption.quantity;
    const amountDifference =
      (newQuantity - oldQuantity) * bookingOption.unitPrice;

    const updateAmountField = bookingOption.option?.payableOnline
      ? {
          totalAmount:
            amountDifference >= 0
              ? { increment: amountDifference }
              : { decrement: Math.abs(amountDifference) },
        }
      : {
          payableOnBoard:
            amountDifference >= 0
              ? { increment: amountDifference }
              : { decrement: Math.abs(amountDifference) },
        };

    const updatedBooking = await tx.booking.update({
      where: { id: bookingOption.bookingId },
      data: updateAmountField,
    });

    const updatedBookingOption = await tx.bookingOption.update({
      where: { id: bookingOptionId },
      data: { quantity: newQuantity },
    });

    return {
      success: true,
      amountDifference,
      newTotal: updatedBooking.totalAmount,
      updatedBookingOption,
    };
  });
}

// Supprimer une option de réservation
export async function deleteOption(bookingOptionId: string) {
  try {
    const bookingOption = await prisma.bookingOption.findUnique({
      where: { id: bookingOptionId },
      include: { option: true }, // Assure-toi que la relation est bien définie dans le schema Prisma
    });

    if (!bookingOption) throw new Error("❌ Option non trouvée.");

    const amount = bookingOption.unitPrice * bookingOption.quantity;

    const [, updatedBooking] = await prisma.$transaction([
      prisma.bookingOption.delete({ where: { id: bookingOptionId } }),
      prisma.booking.update({
        where: { id: bookingOption.bookingId },
        data: {
          totalAmount: bookingOption.option?.payableOnline
            ? { decrement: amount }
            : undefined,
          payableOnBoard: !bookingOption.option?.payableOnline
            ? { decrement: amount }
            : undefined,
        },
      }),
    ]);

    return {
      success: true,
      newTotal: updatedBooking.totalAmount,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer l'option.");
  }
}
// creer un service avec l'image etc ...
export async function createService(
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  categories: string[],
  defaultPrice: number
) {
  if (!name || price == null || defaultPrice == null || !imageUrl) {
    throw new Error("Tous les champs obligatoires doivent être remplis.");
  }

  return await prisma.service.create({
    data: {
      name,
      amount: price,
      price,
      defaultPrice,
      description,
      categories,
      imageUrl,
      currency: "EUR",
    },
  });
}

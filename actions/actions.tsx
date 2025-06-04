"use server";

import { prisma } from "@/lib/prisma";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import mime from "mime";
import { Option, Service } from "@/types";
import { AppError } from "@/lib/errors";

const priceCache = new Map<string, number>();

// Fonction pour récupérer les jours
export async function getRole(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { role: true },
  });
  if (!user) throw new Error("Utilisateur non trouvé");
  return user;
}
///////////////
// Fonction pour récupérer les jours
export async function addUserToDatabase(
  email: string,
  name: string,
  image: string,
  clerkUserId: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (existingUser) {
      return await prisma.user.update({
        where: { clerkUserId },
        data: { email, name, image },
      });
    }

    const role = await prisma.role.findUnique({ where: { name: "member" } });
    if (!role) throw new AppError("Le rôle spécifié n'existe pas.", 400);

    return await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        image,
        roleId: role.id,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      console.error(`Erreur spécifique: ${error.message}`);
      throw error;
    }
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    throw new AppError(
      "Impossible de créer ou mettre à jour l'utilisateur.",
      500
    );
  }
}
////////////////
// Fonction pour créer un service
export async function createService(
  name: string,
  price: number,
  description: string,
  file: File,
  categories: string[],
  defaultPrice: number
) {
  try {
    if (!name || price == null || defaultPrice == null || !file) {
      throw new Error("Tous les champs obligatoires doivent être remplis.");
    }

    const imageUrl = await uploadImageToServer(file);

    const newService = await prisma.service.create({
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

    return newService;
  } catch (error) {
    console.error("Erreur lors de la création du service :", error);
    throw new Error("Impossible de créer le service.");
  }
}
/////////////
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
//////////////
// Fonction pour récupérer les services d'un utilisateur
export async function getServicesByUser(
  clerkUserId: string
): Promise<Service[]> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      bookings: {
        include: {
          Service: true,
        },
      },
    },
  });
  if (!user) throw new Error("Utilisateur non trouvé");
  return user.bookings
    .map((booking) => {
      const service = booking.Service!;
      return {
        ...service,
        description: service.description ?? undefined,
      };
    })
    .filter(Boolean);
}
////////////////
// Fonction pour récupérer les options
export async function getOptions() {
  const options = await prisma.option.findMany();

  if (!options.length) throw new Error("Aucune option trouvée");
  return options;
}
//////////////
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
///////////////
// Fonction pour récupérer les options d'un service
export async function deleteService(serviceId: string) {
  await prisma.service.delete({ where: { id: serviceId } });
}
///////////////
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
/////////////
// Fonction pour récupérer un service par son ID
export async function getAllServices(): Promise<Service[]> {
  const services = await prisma.service.findMany();
  return services.map((service) => ({
    ...service,
    description: service.description ?? undefined,
  }));
}
////////////
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
///////////////
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
//////////////
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
/////////////
// Fonction pour récupérer le service d'un utilisateur
export async function getServiceForUser(
  clerkUserId: string
): Promise<Service | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      bookings: {
        where: { serviceId: { not: null } },
        include: { Service: true },
      },
    },
  });

  if (!user || user.bookings.length === 0) return null;

  // Comme il n'y a qu'un service, on retourne juste le service du premier booking
  const service = user.bookings[0].Service!;
  return {
    ...service,
    description: service.description ?? undefined,
  };
}
///////////
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
/////////////////////////
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

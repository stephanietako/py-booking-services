"use server";

import { prisma } from "@/lib/prisma";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import mime from "mime";
import { Option, Service } from "@/types";

const priceCache = new Map<string, number>();

export async function getRole(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { role: true },
  });
  if (!user) throw new Error("Utilisateur non trouvé");
  return user;
}

export async function addUserToDatabase(
  email: string,
  name: string,
  image: string,
  clerkUserId: string
) {
  const existingUser = await prisma.user.findUnique({ where: { clerkUserId } });

  if (existingUser) {
    return await prisma.user.update({
      where: { clerkUserId },
      data: { email, name, image },
    });
  }

  const role = await prisma.role.findUnique({ where: { name: "member" } });
  if (!role) throw new Error("Le rôle spécifié n'existe pas.");

  return await prisma.user.create({
    data: {
      clerkUserId,
      email,
      name,
      image,
      roleId: role.id,
    },
  });
}

export async function createService(
  name: string,
  price: number,
  description: string,
  file: File,
  categories: string[],
  defaultPrice: number
) {
  try {
    // Vérification des paramètres
    if (!name || !price || !defaultPrice || !file) {
      throw new Error("Tous les champs obligatoires doivent être remplis.");
    }

    // Téléchargement de l'image
    const imageUrl = await uploadImageToServer(file);

    // Création du service dans la base de données
    const newService = await prisma.service.create({
      data: {
        name,
        amount: price,
        price,
        defaultPrice,
        description,
        categories,
        imageUrl,
        currency: "EUR", // Devise par défaut
      },
    });

    return newService;
  } catch (error) {
    console.error("Erreur lors de la création du service :", error);
    throw new Error("Impossible de créer le service.");
  }
}

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

export async function getOptionsByServiceId(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { options: true },
  });
  if (!service) throw new Error("Service non trouvé");
  return service.options;
}

export async function addOptionToService(
  serviceId: string,
  amount: number,
  description: string
): Promise<Option> {
  const createdOption = await prisma.option.create({
    data: {
      amount,
      name: description,
      label: description,
      serviceId,
    },
  });

  return {
    ...createdOption,
    serviceId: createdOption.serviceId ?? undefined,
    description: description,
  };
}

export async function deleteService(serviceId: string) {
  await prisma.bookingOption.deleteMany({ where: { option: { serviceId } } });
  await prisma.option.deleteMany({ where: { serviceId } });
  await prisma.service.delete({ where: { id: serviceId } });
}

export async function deleteManyoption(optionId: string) {
  const option = await prisma.option.findUnique({ where: { id: optionId } });
  if (!option) return;
  await prisma.bookingOption.deleteMany({ where: { optionId } });
  await prisma.option.delete({ where: { id: optionId } });
}

export async function getAllServices(): Promise<Service[]> {
  const services = await prisma.service.findMany({
    include: { options: true },
  });
  return services.map((service) => ({
    ...service,
    description: service.description ?? undefined,
    options: service.options.map((opt) => ({
      ...opt,
      description: opt.label, // 👈 ajout pour correspondre au type `Option`
      serviceId: opt.serviceId ?? undefined, // Convert null to undefined
    })),
  }));
}

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
  const price = rule ? rule.price : 1500; // Valeur par défaut si aucune règle n'est trouvée
  priceCache.set(cacheKey, price);
  return price;
}

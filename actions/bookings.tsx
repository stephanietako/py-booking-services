"use server";

import { prisma } from "@/lib/prisma";

// Récupérer toutes les réservations de l'utilisateur
export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true }, // Inclure les détails du service
    });

    return bookings;
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    throw new Error("Impossible de récupérer les réservations.");
  }
}

// Ajouter une réservation
export async function addUserBooking(userId: string, serviceId: string) {
  try {
    // Vérifier si le service est déjà réservé par l’utilisateur
    const existingBooking = await prisma.booking.findFirst({
      where: { userId, serviceId },
    });

    if (existingBooking) {
      throw new Error("Vous avez déjà réservé ce service.");
    }

    // Ajouter la réservation
    await prisma.booking.create({
      data: {
        userId,
        serviceId,
      },
    });

    return { message: "Service réservé avec succès !" };
  } catch (error) {
    console.error("Erreur lors de l’ajout de la réservation:", error);
    throw new Error("Impossible de réserver ce service.");
  }
}

// Supprimer une réservation
export async function deleteUserBooking(userId: string, serviceId: string) {
  try {
    await prisma.booking.deleteMany({
      where: { userId, serviceId },
    });

    return { message: "Réservation annulée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    throw new Error("Impossible de supprimer la réservation.");
  }
}

import { prisma } from "@/lib/prisma";

export async function getDays(serviceName: string) {
  const service = await prisma.service.findUnique({
    where: { name: serviceName },
  });

  if (!service) throw new Error("Service non trouvé");

  const days = await prisma.day.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  // ❌ Retirer le where: { serviceId: ... } car non existant
  const closedDays = await prisma.closedDay.findMany();

  return {
    days,
    closedDays: closedDays.map((d) => d.date.toISOString().split("T")[0]),
  };
}

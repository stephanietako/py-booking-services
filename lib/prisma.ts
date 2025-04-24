// import { PrismaClient } from "@prisma/client";

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// // 👇 Ajoute cette ligne de sécurité
// const globalForPrisma = globalThis as unknown as {
//   prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
// };

// export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

// // 👇 Et assigne uniquement en non-prod
// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prismaGlobal = prisma;
// }
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// 👇 Ajoute cette ligne de sécurité
const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

// 👇 Et assigne uniquement en non-prod
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

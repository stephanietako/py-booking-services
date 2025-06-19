// app/admin/dashboard/users/page.tsx

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminUserList from "@/app/components/AdminUserList/AdminUserList";

export default async function AdminUsersPage() {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
    include: { role: true },
  });

  if (dbUser?.role?.name !== "admin") redirect("/");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <AdminUserList />
    </main>
  );
}

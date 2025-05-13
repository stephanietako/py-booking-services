// app/admin/dashboard/users/edit/[clerkUserId]/page.tsx

// app/admin/dashboard/users/edit/[clerkUserId]/page.tsx
import { prisma } from "@/lib/prisma";
import EditUserForm from "@/app/components/EditUserForm/EditUserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const { clerkUserId } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: clerkUserId },
    select: {
      clerkUserId: true,
      name: true,
      email: true,
      phoneNumber: true,
      description: true,
    },
  });

  if (!user) {
    return <p>Utilisateur introuvable</p>;
  }

  return <EditUserForm user={user} />;
}

// app/admin/dashboard/edit/[clerkUserId]/page.tsx
import EditUserForm from "@/app/components/EditUserForm/EditUserForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditUserPageProps {
  params: Promise<{
    clerkUserId: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { clerkUserId } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      clerkUserId: true,
      name: true,
      email: true,
      phoneNumber: true,
      description: true,
    },
  });

  if (!user) {
    notFound();
  }

  return <EditUserForm user={user} />;
}

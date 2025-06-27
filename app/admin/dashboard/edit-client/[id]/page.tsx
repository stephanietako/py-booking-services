import EditClientForm from "@/app/components/EditClientForm/EditClientForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function EditClientPage({ params }: EditClientPageProps) {
  const client = await prisma.client.findUnique({
    where: { id: Number((await params).id) },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
    },
  });

  if (!client) return notFound();

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        Modifier le client
      </h1>
      <EditClientForm client={client} />
    </main>
  );
}

// app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Erreur de configuration");
  throw new Error(
    "Configuration du serveur incomplète. Veuillez contacter l'administrateur."
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop() || "bin";
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const filePath = uniqueFileName;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("hero-media")
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erreur lors de l'upload Supabase:", uploadError);
      return NextResponse.json(
        { message: `Échec de l'upload du fichier: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("hero-media")
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error(
        "Impossible de récupérer l'URL publique pour le fichier:",
        filePath
      );
      return NextResponse.json(
        { message: "Échec de la récupération de l'URL publique du fichier." },
        { status: 500 }
      );
    }

    const publicUrl = publicUrlData.publicUrl;
    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    const existingConfig = await prisma.heroConfig.findFirst();

    let updatedConfig;
    if (existingConfig) {
      updatedConfig = await prisma.heroConfig.update({
        where: { id: existingConfig.id },
        data: { mediaUrl: publicUrl, mediaType },
      });
    } else {
      updatedConfig = await prisma.heroConfig.create({
        data: { mediaUrl: publicUrl, mediaType },
      });
    }

    console.log("Configuration Hero mise à jour:", updatedConfig);

    return NextResponse.json({ url: publicUrl, mediaType }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur inattendue dans l'upload:", error);
    let message = "Erreur interne du serveur";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}

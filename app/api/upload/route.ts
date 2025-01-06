// import { NextApiRequest, NextApiResponse } from "next";
// import fs from "fs";
// import path from "path";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const uploadDir = path.join(process.cwd(), "public/uploads");

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method === "POST") {
//     try {
//       // Créer le dossier s'il n'existe pas
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const chunks: Buffer[] = [];
//       req.on("data", (chunk) => {
//         chunks.push(chunk);
//       });

//       req.on("end", () => {
//         const buffer = Buffer.concat(chunks);
//         const fileName = `${Date.now()}-${req.headers["file-name"]}`;
//         const filePath = path.join(uploadDir, fileName);

//         fs.writeFile(filePath, buffer, (err) => {
//           if (err) {
//             return res
//               .status(500)
//               .json({ error: "Erreur lors du téléchargement du fichier" });
//           }
//           const fileUrl = `/uploads/${fileName}`;
//           res.status(200).json({ url: fileUrl });
//         });
//       });
//     } catch {
//       res
//         .status(500)
//         .json({ error: "Erreur lors du téléchargement du fichier" });
//     }
//   } else {
//     res.status(405).json({ error: "Méthode non autorisée" });
//   }
// };

// export default handler;
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import mime from "mime";
import prisma from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// Le répertoire où les images seront sauvegardées
const uploadDir = path.join(process.cwd(), "public/uploads");

export async function POST(req: NextRequest) {
  try {
    // Récupérer l'authentification de l'utilisateur
    const { userId } = getAuth(req); // Clerk extrait le userId à partir du token JWT

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { name, amount, categories, imageUrl } = await req.json();

    if (!imageUrl || !name || isNaN(amount)) {
      return NextResponse.json(
        { error: "Données manquantes ou incorrectes" },
        { status: 400 }
      );
    }

    // Créer le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    // Vérifier si imageUrl est une URL et traiter l'image (ou ajuster si c'est un fichier multipart)
    const buffer = Buffer.from(await imageUrl.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = mime.extension("image/jpeg"); // ou un type MIME fixe pour test
    const fileName = `${name
      .replace(/\s+/g, "-")
      .toLowerCase()}-${uniqueSuffix}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    // Enregistrer dans la base Prisma avec le userId dynamique
    const newService = await prisma.service.create({
      data: {
        name,
        amount,
        categories,
        imageUrl: fileUrl,
        userId, // Utilisation de l'ID dynamique de l'utilisateur
      },
    });

    return NextResponse.json(
      { url: fileUrl, service: newService },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

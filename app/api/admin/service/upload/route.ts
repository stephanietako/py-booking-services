// app/api/admin/service/upload/route.ts
import { writeFile, mkdir, stat } from "fs/promises";
import { join } from "path";
import mime from "mime";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === "string") {
    return new Response("Fichier manquant", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = mime.getExtension(file.type) || "png";

  const relativeDir = `/uploads/${new Date().toISOString().split("T")[0]}`;
  const uploadDir = join(process.cwd(), "public", relativeDir);

  await stat(uploadDir).catch(() => mkdir(uploadDir, { recursive: true }));

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = join(uploadDir, uniqueName);

  await writeFile(filePath, buffer);

  return Response.json({ imageUrl: `${relativeDir}/${uniqueName}` });
}
//////////
// Frontend (React client page)
// const formData = new FormData();
// formData.append("file", selectedFile);

// const res = await fetch("/api/admin/service/upload", {
//   method: "POST",
//   body: formData,
// });
// const { imageUrl } = await res.json();
////////////

// app/api/webhooks/clerk/route.ts
// import { Webhook } from "svix";
// import { headers } from "next/headers"; // headers() renvoie une Promise<ReadonlyHeaders>
// import { addUserToDatabase } from "@/actions/actions";
// import type { WebhookEvent } from "@clerk/nextjs/server";

// export async function POST(req: Request) {
//   const body = await req.text(); // Clerk envoie du texte brut
//   const headerList = await headers(); // <-- NOUVEAU : await ici pour obtenir l'objet ReadonlyHeaders

//   const svixId = headerList.get("svix-id") ?? "";
//   const svixTimestamp = headerList.get("svix-timestamp") ?? "";
//   const svixSignature = headerList.get("svix-signature") ?? "";

//   const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

//   let evt: WebhookEvent;

//   try {
//     evt = wh.verify(body, {
//       "svix-id": svixId,
//       "svix-timestamp": svixTimestamp,
//       "svix-signature": svixSignature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error("❌ Webhook verification failed:", err);
//     return new Response("Invalid webhook signature", { status: 400 });
//   }

//   if (evt.type === "user.created") {
//     const user = evt.data;

//     const email = user.email_addresses?.[0]?.email_address ?? "";
//     const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
//     const image = user.image_url ?? "";
//     const clerkUserId = user.id;
//     const phoneNumber = user.phone_numbers?.[0]?.phone_number ?? "";

//     await addUserToDatabase(email, name, image, clerkUserId, phoneNumber);
//     return new Response("✅ User processed", { status: 200 });
//   }

//   return new Response("ℹ️ Event not handled", { status: 200 });
// }
// app/api/webhooks/clerk/route.ts
// import { Webhook } from "svix";
// import { headers } from "next/headers";
// import { addUserToDatabase } from "@/actions/actions";
// import type { WebhookEvent } from "@clerk/nextjs/server";

// export async function POST(req: Request) {
//   const body = await req.text();
//   const headerList = await headers();

//   const svixId = headerList.get("svix-id") ?? "";
//   const svixTimestamp = headerList.get("svix-timestamp") ?? "";
//   const svixSignature = headerList.get("svix-signature") ?? "";

//   const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

//   let evt: WebhookEvent;

//   try {
//     evt = wh.verify(body, {
//       "svix-id": svixId,
//       "svix-timestamp": svixTimestamp,
//       "svix-signature": svixSignature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error("❌ Webhook verification failed:", err);
//     return new Response("Invalid webhook signature", { status: 400 });
//   }

//   // 🚨 AJOUTEZ CE LOG ICI POUR VÉRIFIER LE TYPE D'ÉVÉNEMENT
//   console.log("➡️ Webhook received event type:", evt.type);

//   if (evt.type === "user.created" || evt.type === "user.updated") {
//     const user = evt.data;

//     const email = user.email_addresses?.[0]?.email_address ?? "";
//     const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
//     const image = user.image_url ?? "";
//     const clerkUserId = user.id;
//     const phoneNumber = user.phone_numbers?.[0]?.phone_number ?? "";

//     await addUserToDatabase(email, name, image, clerkUserId, phoneNumber);
//     return new Response("✅ User processed (created/updated)", { status: 200 });
//   }

//   return new Response("ℹ️ Event not handled", { status: 200 });
// }
// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/clerk";
import { PrismaClient } from "@prisma/client";
import { addUserToDatabase } from "@/actions/actions";
import { ClerkWebhookEvent } from "@/types";

const prisma = new PrismaClient();
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { event } = await verifyClerkWebhook(req, CLERK_WEBHOOK_SECRET);
    const { type, data } = event as ClerkWebhookEvent;

    console.log("📨 Clerk event type:", type);

    switch (type) {
      case "user.created":
      case "user.updated":
        await addUserToDatabase(
          data.email_addresses[0]?.email_address ?? "",
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          data.image_url ?? "",
          data.id,
          "" // Pas de téléphone utilisé
        );
        break;

      case "user.deleted":
        const deleted = await prisma.user.deleteMany({
          where: { clerkUserId: data.id },
        });

        if (deleted.count === 0) {
          console.warn(
            "⚠️ Tentative de suppression d'un user non trouvé:",
            data.id
          );
        }

        break;

      default:
        console.log("🔕 Unhandled Clerk event:", type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

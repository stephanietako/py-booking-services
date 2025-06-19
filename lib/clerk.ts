import { Webhook } from "svix";

export async function verifyClerkWebhook(req: Request, secret: string) {
  const payload = await req.text();
  const svix_id = req.headers.get("svix-id")!;
  const svix_timestamp = req.headers.get("svix-timestamp")!;
  const svix_signature = req.headers.get("svix-signature")!;

  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  const wh = new Webhook(secret);
  const event = wh.verify(payload, headers);

  return { event, rawBody: payload };
}

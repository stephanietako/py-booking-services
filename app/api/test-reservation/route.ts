// app/api/test-reservation/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Nom et email sont requis." },
        { status: 400 }
      );
    }

    console.log("Réservation test reçue:", data);

    return NextResponse.json({ message: "Réservation test enregistrée." });
  } catch (error) {
    console.error("Erreur lors de la réservation test:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

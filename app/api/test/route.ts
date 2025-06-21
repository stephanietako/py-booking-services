// app/api/test/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🎯 Route de test appelée !");

  return NextResponse.json({
    message: "Test route works!",
    timestamp: new Date().toISOString(),
    success: true,
  });
}

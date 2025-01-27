import { NextRequest, NextResponse } from "next/server";
import { closeDay } from "@/actions/openingActions";

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const result = await closeDay(input);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

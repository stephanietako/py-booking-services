import { NextResponse } from "next/server";
import { getClosedDays } from "@/actions/openingActions";

export async function GET() {
  try {
    const closedDays = await getClosedDays();
    return NextResponse.json(closedDays, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

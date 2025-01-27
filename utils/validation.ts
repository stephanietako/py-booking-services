import { CloseDayInput } from "@/types";

export function validateCloseDayInput(input: CloseDayInput): { date: Date } {
  const date = new Date(input.date);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }
  return { date };
}

//app/constants/config.ts
export const Service_opening_time = 8; // in hours
export const Service_closing_time = 20; // in hours
export const Interval = 30; // in minutes

export const categories = [
  "all",
  "Découverte",
  "Simplicité",
  "Premium",
] as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 5; //5M

export const now = new Date(); // Do not use this in mutated functions, e.g. setHours(0, 0, 0, 0)

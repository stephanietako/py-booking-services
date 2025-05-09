//app/constants/config.ts
export const Service_opening_time = 9; // in hours
export const Service_closing_time = 18; // in hours
export const Interval = 60; // in minutes

export const categories = ["Service"] as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 5; //5M

export const now = new Date(); // Do not use this in mutated functions, e.g. setHours(0, 0, 0, 0)

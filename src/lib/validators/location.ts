import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { locations } from "@/db/schema";
import { buildings } from "@/config/constants";

const buildingNames = buildings.map((building) => building.name);
const buildingCodes = buildings.map((building) => building.code);

export const locationSchema = createSelectSchema(locations);

export const createLocationSchema = z.object({
  building: z.enum(buildingNames, { message: "Select a building" }),
  roomNumber: z.string().trim().min(1, "Room number is required").max(20, "Room number is too long"),
  roomName: z.string().trim().max(100, "Room name is too long").nullable(),
});

export const insertLocationSchema = createLocationSchema.extend({
  code: z.enum(buildingCodes, { message: "Unknown building code" }),
});

export const updateLocationSchema = createLocationSchema.partial();

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { addresses, locations } from "@/db/schema";
import { buildings, countries } from "@/config/constants";

const buildingNames = buildings.map((building) => building.name);
const buildingCodes = buildings.map((building) => building.code);
const countryNames = countries.map((country) => country.name);

// Location
export const locationSchema = createSelectSchema(locations);

export const createLocationSchema = z
  .object({
    building: z.enum(buildingNames, { message: "Select a building" }),
    code: z.enum(buildingCodes, { message: "Select a building code" }),
    roomNumber: z.string().trim().min(1, "Room number is required").max(20, "Room number is too long"),
    roomName: z.string().trim().max(100, "Room name is too long").nullable(),
  })
  .refine(
    (location) =>
      buildings.some(
        (building) => building.name === location.building && building.code === location.code,
      ),
    { path: ["code"], message: "Code does not match the selected building" },
  );

// Address
export const addressSchema = createSelectSchema(addresses);

export const createAddressSchema = z.object({
  street: z.string().trim().min(1, "Street is required").max(200, "Street is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  state: z.string().trim().max(100, "State is too long").nullable(),
  postalCode: z.string().trim().max(20, "Postal code is too long").nullable(),
  country: z.enum(countryNames, { message: "Select a country" }).nullable(),
});

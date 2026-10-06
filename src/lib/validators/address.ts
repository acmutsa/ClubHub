import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { addresses } from "@/db/schema";
import { countries } from "@/constants/countries";
import { usStates } from "@/constants/us-states";

// The database stores the 2-letter country and state 
const countryCodes = countries.map((country) => country.code);
const usStateCodes = usStates.map((state) => state.code);


export const addressSchema = createSelectSchema(addresses);

const addressFieldsSchema = z.object({
  street: z.string().trim().min(1, "Street is required").max(200, "Street is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  state: z.enum(usStateCodes, { message: "Select a state" }).nullable(),
  postalCode: z.string().trim().max(20, "Postal code is too long").transform((postalCode) => postalCode || null).nullable(),
  country: z.enum(countryCodes, { message: "Select a country" }).nullable(),
});

export const updateAddressSchema = addressFieldsSchema.partial();

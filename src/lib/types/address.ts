import { z } from "zod";
import { addressSchema, updateAddressSchema } from "@/lib/validators/address";

export type Address = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

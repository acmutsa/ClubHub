import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
// You can specify any property from the libsql connection options
export const db = drizzle({
  connection: {
    url: "http://127.0.0.1:8080",
    // url: process.env.TURSO_DATABASE_URL!,
    // authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  schema: { ...schema },
});

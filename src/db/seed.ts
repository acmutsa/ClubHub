import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";

import * as schema from "@/db/schema";
import { defaults as d } from "@/../clubhub.config";

const { verification, ...seedSchema } = schema;

async function main() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });

  await seed(db, seedSchema).refine((f) => ({
    clubs: {
      isUnique: true,
      count: 5,
      columns: {
        id: f.uuid(),
        name: f.companyName(),
        description: f.loremIpsum(),
      },
      with: {
        eventTypes: 4,
        events: 10,
      },
    },
    buildings: {
      columns: {
        name: f.valuesFromArray({ values: d.buildings.map((b) => b.name) }),
        code: f.valuesFromArray({ values: d.buildings.map((b) => b.code) }),
      },
      with: {
        locations: 5,
      },
    },
    locations: {
      columns: {
        name: f.lastName(),
        roomNumber: f.number({
          minValue: 1,
          maxValue: 5,
          precision: 1000,
          isUnique: false,
        }),
      },
    },
    eventTypes: {
      columns: {
        name: f.valuesFromArray({
          values: d.eventTypes.map((e) => e.name),
        }),
        color: f.valuesFromArray({
          values: d.eventTypes.map((e) => e.color),
        }),
        requiredPoints: f.int({ minValue: 0, maxValue: 50 }),
      },
    },
    events: {
      columns: {
        title: f.companyName(),
        description: f.loremIpsum(),
        start: f.date({ minDate: "2024-01-01", maxDate: "2025-12-31" }),
        end: f.date({ minDate: "2024-01-01", maxDate: "2025-12-31" }), // Note: Logic for end > start isn't strictly enforced by simple generator, but good enough for seed
        points: f.int({ minValue: 10, maxValue: 100 }),
        hidden: f.boolean(),
      },
    },
    thumbnails: {
      columns: {
        url: f.valuesFromArray({
          values: [
            "https://api.dicebear.com/9.x/glass/svg?seed=Felix",
            "https://api.dicebear.com/9.x/glass/svg?seed=Aneka",
            "https://api.dicebear.com/9.x/glass/svg?seed=Mark",
            "https://api.dicebear.com/9.x/glass/svg?seed=Jasmine",
            "https://api.dicebear.com/9.x/glass/svg?seed=Robert",
            "https://api.dicebear.com/9.x/glass/svg?seed=Olivia",
            "https://api.dicebear.com/9.x/glass/svg?seed=Emma",
            "https://api.dicebear.com/9.x/glass/svg?seed=Noah",
            "https://api.dicebear.com/9.x/glass/svg?seed=Oliver",
            "https://api.dicebear.com/9.x/glass/svg?seed=Isabella",
            "https://api.dicebear.com/9.x/glass/svg?seed=William",
          ],
        }),
      },
    },
    membership: {
      columns: {
        role: f.weightedRandom([
          { weight: 0.8, value: f.valuesFromArray({ values: ["member"] }) },
          { weight: 0.15, value: f.valuesFromArray({ values: ["admin"] }) },
          {
            weight: 0.05,
            value: f.valuesFromArray({ values: ["super_admin"] }),
          },
        ]),
      },
    },
  }));
}

main();

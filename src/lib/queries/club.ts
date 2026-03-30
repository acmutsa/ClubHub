'use server'
import { db } from "@/db/index";
import { clubs, membership, events, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql"
import { unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminClubRow } from "@/lib/types/club";

export async function getClub(slug: string) {
  if (!slug?.trim()) {
    return null;
  } ``
  const club = await db.query.clubs.findFirst({ where: eq(clubs.slug, slug) });
  return club || null;
}

export async function getAdminTotalClubCount(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const role = session.user.role;
  if (role !== "admin" && role !== "super_admin") {
    unauthorized();
  }
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clubs);

  return result[0]?.count ?? 0;
}

export async function getAllClubsData(): Promise<AdminClubRow[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const role = session.user.role;
  if (role !== "admin" && role !== "super_admin") {
    unauthorized();
  }

  const clubRows = await db.select({
    id: clubs.id,
    name: clubs.name,
    description: clubs.description,
    ownerId: clubs.owner,
    ownerName: user.name,
    slug: clubs.slug,
    memberCount: sql<number>`(
      SELECT COUNT(*)
      FROM membership
      WHERE membership.slug = clubs.slug
    )`,
    eventCount: sql<number>`(
      SELECT COUNT(*)
      FROM events
      WHERE events.slug = clubs.slug
    )`,
  })
  .from(clubs)
  .innerJoin(user, eq(user.id, clubs.owner));

  return clubRows;
}

export async function getClubBySlug(slug: string) {
  if (!slug?.trim()) {
    return null;
  } ``
  const club = await db.query.clubs.findFirst({ where: eq(clubs.slug, slug) });
  return club || null;
}

export async function checkSlugUniqueness(slug: string) {
  const existingSlug = await db.query.clubs.findFirst({ where: eq(clubs.slug, slug) });
  return existingSlug == null;
}
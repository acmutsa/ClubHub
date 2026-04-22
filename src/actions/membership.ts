"use server";

import { clubRoles, clubs, membership, membershipRole } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { z } from "zod";
import { randomUUID } from "crypto";
import { user as users } from "@/db/auth.schema";
import { getClubBySlug } from "@/lib/queries/club";
import { returnValidationErrors } from "next-safe-action";
import { createRoleSchema } from "@/lib/types/membership";
import { hasClubPermission } from "@/lib/membership";
import { adminPermissions } from "@/lib/types/club-admin";

export const leaveClub = authAction
  .bindArgsSchemas<[slug: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [slug], ctx: { userId } }) => {
    const club = await getClubBySlug(slug);
    if (!club) throw new Error("Club not found");

    const membershipRow = await db
      .select()
      .from(membership)
      .where(
        and(
          eq(membership.userId, userId),
          eq(membership.clubId, club.id)
        )
      )
      .limit(1);
    if (!membershipRow.length) {
      return;
    }

    const membershipId = membershipRow[0].id;

    await db
      .delete(membershipRole)
      .where(eq(membershipRole.membershipId, membershipId));

    await db
      .delete(membership)
      .where(eq(membership.id, membershipId));

    revalidatePath("/clubs");
  });

export const joinClub = authAction
  .bindArgsSchemas<[slug: z.ZodString]>([z.string()])
  .action(async ({ bindArgsParsedInputs: [slug], ctx: { userId } }) => {
    const club = await getClubBySlug(slug);
    if (!club) throw new Error("Club not found"); 

    const existing = await db
      .select()
      .from(membership)
      .where(
        and(
          eq(membership.userId, userId),
          eq(membership.clubId, club.id)
        )
      )
      .limit(1);
    
    let membershipId: number;

    if (existing.length > 0) {
      membershipId = existing[0].id;
    } else {
      const [row] = await db
        .insert(membership)
        .values({
          userId,
          clubId: club.id
        })
        .returning({ id: membership.id });

      membershipId = row.id;
    }

    const defaultRole = await db
      .select({ id: clubRoles.id })
      .from(clubRoles)
      .where(
        and(
          eq(clubRoles.clubId, club.id),
          eq(clubRoles.isDefault, true)
        )
      )
      .limit(1);

    if (!defaultRole.length) {
      throw new Error("No default role set for this club");
    }

    await db.insert(membershipRole).values({
      membershipId,
      roleId: defaultRole[0].id,
    });

    revalidatePath("/clubs");
  });

export const createClub = authAction
  .bindArgsSchemas<
    [name: z.ZodString, description: z.ZodString, slug: z.ZodString,]
  >([z.string().min(1, "Club Name Required"), z.string().min(1, "Description Required"), z.string().min(1,"Club Slug Required")])
  .action(async ({ 
    bindArgsParsedInputs: [name, description, slug], 
    ctx: { userId }, 
  }) => {
    const clubId = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(clubs).values({
        id: clubId,
        name,
        description,
        ownerId: userId,
        slug: slug,
      });

      await tx.insert(clubRoles).values({
        clubId,
        name: "member",
        permissions: 0,
        position: 0,
        isDefault: true,
      });

      const [ownerRole] = await tx
        .insert(clubRoles)
        .values({
          clubId,
          name: "owner",
          permissions: 31,
          position: -1,
        })
        .returning({ id: clubRoles.id });
      

      const [membershipRow] = await tx
        .insert(membership)
        .values({
          userId,
          clubId,
        })
        .returning({ id: membership.id });
      
      await tx.insert(membershipRole).values({
        membershipId: membershipRow.id,
        roleId: ownerRole.id,
      });
    });
    revalidatePath("/clubs");
    return { slug };
    },
  );

export const transferOwnership = authAction
  .bindArgsSchemas<
    [slug: z.ZodString, email: z.ZodString]
  >([z.string(), z.string().email()])
  .action(async ({ bindArgsParsedInputs: [slug, email], ctx: { userId } }) => {
    const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug));
    if (!club || club.ownerId !== userId) {
      throw new Error("Error: Not authorized");
    }

    const [newOwner] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (!newOwner) throw new Error("Error: User not found");

    const members = await db
      .select()
      .from(membership)
      .where(eq(membership.clubId, club.id));
    if (members.length === 0) {
      throw new Error("Error: User is not a member of this club");
    }

    const oldOwnerMembership = members.find(
      (m) => m.userId === userId
    );

    const newOwnerMembership = members.find(
      (m) => m.userId === newOwner.id
    );

    if (!newOwnerMembership || !oldOwnerMembership) {
      throw new Error("User is not a member of this club");
    }

    const roles = await db
      .select()
      .from(clubRoles)
      .where(eq(clubRoles.clubId, club.id));

    const memberRole = roles.find((r) => r.isDefault);
    const ownerRole = roles.find(r => r.name === "owner");

    if (!memberRole || !ownerRole) {
      throw new Error("Missing required roles");
    }

    // Update club owner
    await db
      .update(clubs)
      .set({ ownerId: newOwner.id })
      .where(eq(clubs.id, club.id));

    // Old owner becomes member
    await db
      .delete(membershipRole)
      .where(eq(membershipRole.membershipId, oldOwnerMembership.id));

    await db.insert(membershipRole).values({
      membershipId: oldOwnerMembership.id,
      roleId: memberRole.id,
    });

    // New owner becomes owner role
    await db
      .delete(membershipRole)
      .where(eq(membershipRole.membershipId, newOwnerMembership.id));
    
    await db.insert(membershipRole).values({
      membershipId: newOwnerMembership.id,
      roleId: ownerRole.id
    });
  });

export const createRoleAction = authAction
  .inputSchema(createRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = ctx;

    const club = await getClubBySlug(parsedInput.slug);
    if (!club) {
      returnValidationErrors(z.null(), {
        _errors: ["Club not found"],
      });
      return;
    }

    if (!(await hasClubPermission(userId, parsedInput.slug, adminPermissions.MANAGE_CLUB))) {
      returnValidationErrors(z.null(), {
        _errors: ["No permission"],
      });
      return;
    }

    await db.insert(clubRoles).values({
      clubId: club.id,
      name: parsedInput.name,
      position: parsedInput.position,
      permissions: parsedInput.permissions,
    });

    return { success: true };
  })
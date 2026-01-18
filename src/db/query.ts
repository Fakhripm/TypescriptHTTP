import { db } from "./index.js";
import { NewUser, users, NewChirp, chirps, NewRefreshToken, refreshTokens } from "./schema.js";
import { asc, eq, and, isNull, gt } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getAllChirps() {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
  return result;
}

export async function getChirpsByAuthorID(authorId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, authorId))
    .orderBy(asc(chirps.createdAt));
  return result;
}

export async function getChirpByID(id: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));
  return result;
}

export async function deleteChirpByID(id: string) {
  await db
    .delete(chirps)
    .where(eq(chirps.id, id));
}

export async function createRefreshToken(token: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(token)
    .returning();
  return result;
}

export async function getUserFromRefreshToken(token: string) {
  const now = new Date();
  const [result] = await db
    .select({
      id: users.id,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      email: users.email,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, now)
      )
    );
  return result;
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token));
}

export async function updateUser(userId: string, updateData: Record<string, string>) {
  const [result] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();
  return result;
}

export async function upgradeUserToChirpyRed(userId: string) {
  const [result] = await db
    .update(users)
    .set({
      isChirpyRed: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return result;
}
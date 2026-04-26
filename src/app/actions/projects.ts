"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";
import type { DbClient } from "@/lib/data";

export async function registerProject(
  githubRepo: string,
  clientEmail: string,
  projectName: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const db = await getDb();
  const doc: DbClient = {
    userId,
    projectName,
    githubRepo,
    clientEmail,
    // Keep legacy email field populated to satisfy existing unique indexes.
    email: clientEmail,
    branch: "main",
    createdAt: new Date(),
  };
  const result = await db.collection<DbClient>("clients").insertOne(doc);
  return result.insertedId.toHexString();
}

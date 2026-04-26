import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";
import type { DbClient, Project } from "@/lib/data";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const clients = await db
    .collection<DbClient>("clients")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  const projects: Project[] = clients.map((c) => ({
    id: c._id!.toHexString(),
    name: c.projectName,
    branch: c.branch,
    email: c.clientEmail || c.email || "",
    githubRepo: c.githubRepo,
    status: "active" as const,
    feedbackCount: 0,
    lastActivity: "just now",
    tech: [],
  }));

  return NextResponse.json({ projects });
}

import Link from "next/link";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/mongodb";
import ProjectDetailView from "@/components/ProjectDetailView";
import type { DbTask, DbAuditLog, DbClient, Feedback, Project } from "@/lib/data";

function mapTaskStatus(rawStatus: string | undefined): Feedback["status"] {
  switch ((rawStatus ?? "").toLowerCase()) {
    case "pending":
    case "queued":
      return "queued";
    case "leased":
      return "leased";
    case "implementing":
    case "in_progress":
      return "implementing";
    case "testing":
      return "testing";
    case "staging":
      return "staging";
    case "done":
    case "completed":
    case "deployed":
      return "deployed";
    case "rejected":
      return "rejected";
    default:
      return "queued";
  }
}

function mapTaskPriority(rawPriority: string | undefined): Feedback["priority"] {
  const value = (rawPriority ?? "").toLowerCase();
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function toDisplayDate(value: unknown): string {
  if (!value) return new Date().toLocaleString();
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }
  if (typeof value === "object" && "$date" in (value as Record<string, unknown>)) {
    const raw = (value as { $date?: string }).$date;
    if (!raw) return new Date().toLocaleString();
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? raw : date.toLocaleString();
  }
  return new Date().toLocaleString();
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const animateSidebar = resolvedSearchParams?.from === "dashboard";

  if (!ObjectId.isValid(id)) {
    return <ProjectNotFound />;
  }

  const db = await getDb();
  const objectId = new ObjectId(id);

  const clientDoc = await db
    .collection<DbClient>("clients")
    .findOne({ _id: objectId });

  if (!clientDoc) {
    return <ProjectNotFound />;
  }

  const { userId } = await auth();

  const tasks = await db
    .collection<DbTask>("tasks")
    .find({
      $or: [
        { project_id: objectId },
        { project_id: id },
        { project_id: clientDoc.githubRepo },
      ],
    })
    .sort({ created_at: -1, receivedAt: -1, received_at: -1 })
    .toArray();

  const taskIds = tasks.map((t) => t._id!);
  const auditLogs =
    taskIds.length > 0
      ? await db
          .collection<DbAuditLog>("audit_log")
          .find({ task_id: { $in: taskIds } })
          .sort({ timestamp: 1 })
          .toArray()
      : [];

  const logsMap = new Map<string, string[]>();
  for (const log of auditLogs) {
    const key = log.task_id.toHexString();
    if (!logsMap.has(key)) logsMap.set(key, []);
    logsMap.get(key)!.push(
      `${log.timestamp.toISOString().replace("T", " ").slice(0, 19)} — ${log.message}`,
    );
  }

  const feedback: Feedback[] = tasks.map((t) => {
    const task = t as DbTask & {
      subject?: string;
      raw_text?: string;
      sender?: string;
      sender_email?: string;
      received_at?: string;
      urgency?: string;
      extracted_requirements?: string[];
      handoff_instructions?: string;
      created_at?: Date | string | { $date?: string };
    };
    const taskKey = t._id!.toHexString();
    const mappedStatus = mapTaskStatus(task.status);
    const isLeased = mappedStatus === "leased" && task.claimed_by !== null;
    const fallbackSummary =
      task.extracted_requirements?.[0] ??
      task.raw_text?.trim().slice(0, 160) ??
      "New feedback item";
    const fallbackContent =
      task.raw_text?.trim() ?? task.handoff_instructions ?? fallbackSummary;
    return {
      id: taskKey,
      title: task.title ?? task.subject ?? "Untitled feedback",
      summary: task.summary ?? fallbackSummary,
      content: task.content ?? fallbackContent,
      from: task.from ?? task.sender_email ?? task.sender ?? "Unknown sender",
      receivedAt: toDisplayDate(task.receivedAt ?? task.received_at ?? task.created_at),
      priority: mapTaskPriority(task.priority ?? task.urgency),
      status: mappedStatus,
      estimatedTime: task.estimatedTime ?? "",
      project: clientDoc.projectName,
      logs: [...(task.logs ?? []), ...(logsMap.get(taskKey) ?? [])],
      isLeased,
      claimedBy: task.claimed_by ?? undefined,
    };
  });

  const allClients = await db
    .collection<DbClient>("clients")
    .find({ userId: userId ?? clientDoc.userId })
    .sort({ createdAt: -1 })
    .toArray();

  const project: Project = {
    id,
    name: clientDoc.projectName,
    branch: clientDoc.branch,
    email: clientDoc.clientEmail || clientDoc.email || "",
    githubRepo: clientDoc.githubRepo,
    status: "active",
    feedbackCount: feedback.length,
    lastActivity: "just now",
    tech: [],
  };

  const allProjects: Project[] = allClients.map((c) => ({
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

  return (
    <ProjectDetailView
      project={project}
      allProjects={allProjects}
      feedback={feedback}
      animateSidebar={animateSidebar}
    />
  );
}

function ProjectNotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "18px",
          background: "rgba(12, 10, 22, 0.55)",
          backdropFilter: "blur(24px)",
          padding: "28px",
          display: "grid",
          gap: "14px",
        }}
      >
        <h1 style={{ fontSize: "1.4rem" }}>Project not found</h1>
        <p style={{ color: "rgba(220,220,228,0.78)" }}>
          This project does not exist or is no longer available.
        </p>
        <Link className="sign-in-btn" href="/dashboard">
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}

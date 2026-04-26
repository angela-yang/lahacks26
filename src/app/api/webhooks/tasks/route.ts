import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type IncomingTaskPayload = {
  email_id?: string;
  thread_id?: string;
  sender?: string;
  sender_email?: string;
  subject?: string;
  received_at?: string;
  raw_text?: string;
  task_type?: string;
  urgency?: string;
  urgency_rank?: number;
  extracted_requirements?: string[];
  context?: Record<string, unknown>;
  handoff_instructions?: string;
  status?: string;
  claimed_by?: string | null;
  claimed_at?: string | null;
  lease_expires_at?: string | null;
  created_at?: string;
  completed_at?: string | null;
  project_id?: string;
  resolution_note?: string | null;
  metadata?: Record<string, unknown>;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function verifyWebhookSignature(body: string, provided: string, secret: string): boolean {
  const computed = createHmac("sha256", secret).update(body).digest("hex");
  const prefixed = `sha256=${computed}`;
  const normalizedProvided = provided.trim();
  const normalizedComputed = normalizedProvided.startsWith("sha256=")
    ? prefixed
    : computed;

  const a = Buffer.from(normalizedProvided);
  const b = Buffer.from(normalizedComputed);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-clanker-signature");
  const secret = process.env.TASK_WEBHOOK_SECRET;

  if (secret) {
    if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  let payload: IncomingTaskPayload;
  try {
    payload = JSON.parse(rawBody) as IncomingTaskPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const dedupeKey =
    payload.email_id ||
    payload.thread_id ||
    (typeof payload.context?.gmail_message_id === "string"
      ? payload.context.gmail_message_id
      : undefined);

  if (!dedupeKey) {
    return NextResponse.json(
      { error: "Missing dedupe key. Provide email_id, thread_id, or context.gmail_message_id." },
      { status: 400 },
    );
  }

  if (!payload.project_id) {
    return NextResponse.json({ error: "Missing required field: project_id" }, { status: 400 });
  }

  const now = new Date();
  const db = await getDb();

  const updateDoc = {
    email_id: payload.email_id ?? null,
    thread_id: payload.thread_id ?? null,
    sender: payload.sender ?? null,
    sender_email: payload.sender_email ?? null,
    subject: payload.subject ?? "Untitled feedback",
    received_at: payload.received_at ?? now.toISOString(),
    raw_text: payload.raw_text ?? "",
    task_type: payload.task_type ?? "feedback",
    urgency: payload.urgency ?? "medium",
    urgency_rank: payload.urgency_rank ?? null,
    extracted_requirements: payload.extracted_requirements ?? [],
    context: payload.context ?? {},
    handoff_instructions: payload.handoff_instructions ?? "",
    status: payload.status ?? "pending",
    claimed_by: payload.claimed_by ?? null,
    claimed_at: parseDate(payload.claimed_at),
    lease_expires_at: parseDate(payload.lease_expires_at),
    created_at: parseDate(payload.created_at) ?? now,
    completed_at: parseDate(payload.completed_at),
    project_id: payload.project_id,
    resolution_note: payload.resolution_note ?? null,
    metadata: payload.metadata ?? {},
    updated_at: now,
  };

  const result = await db.collection("tasks").findOneAndUpdate(
    { dedupe_key: dedupeKey },
    {
      $set: updateDoc,
      $setOnInsert: {
        dedupe_key: dedupeKey,
        inserted_at: now,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  const id = result?._id?.toString();
  return NextResponse.json({
    ok: true,
    taskId: id,
    dedupeKey,
    action: result ? "upserted" : "unknown",
  });
}

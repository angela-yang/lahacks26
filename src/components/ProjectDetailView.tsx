"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import type { Project, Feedback, FeedbackStatus } from "../lib/data";

interface Props {
  project: Project;
  allProjects: Project[];
  feedback: Feedback[];
  onSelectProject: (p: Project) => void;
  onBackToProjects: () => void;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  queued: "Not Started",
  implementing: "Ongoing",
  testing: "Ongoing",
  staging: "Ongoing",
  deployed: "Finished",
  rejected: "Rejected",
};

function feedbackToUiStage(
  status: FeedbackStatus,
): "not-started" | "ongoing" | "finished" {
  if (status === "deployed") return "finished";
  if (status === "queued" || status === "rejected") return "not-started";
  return "ongoing";
}

function statusPillStageClass(status: FeedbackStatus): string {
  const s = feedbackToUiStage(status);
  const slug =
    s === "finished"
      ? "finished"
      : s === "not-started"
        ? "not-started"
        : "ongoing";
  return `status-pill stage-${slug}`;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

export default function ProjectDetailView({
  project,
  allProjects,
  feedback,
  onSelectProject,
  onBackToProjects,
}: Props) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    feedback[0] ?? null,
  );
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered =
    statusFilter === "All Status"
      ? feedback
      : feedback.filter((f) => STATUS_LABELS[f.status] === statusFilter);

  useEffect(() => {
    setSelectedFeedback(feedback[0] ?? null);
  }, [project.id, feedback]);

  useEffect(() => {
    if (!selectedFeedback) {
      setSelectedFeedback(filtered[0] ?? null);
      return;
    }
    const stillVisible = filtered.some((f) => f.id === selectedFeedback.id);
    if (!stillVisible) {
      setSelectedFeedback(filtered[0] ?? null);
    }
  }, [filtered, selectedFeedback]);

  return (
    <div className={`view detail-view ${mounted ? "mounted" : ""}`}>
      <Navbar onHomeClick={onBackToProjects} />
      <div className="detail-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <button
            className="back-button sidebar-back-button"
            onClick={onBackToProjects}
          >
            <BackIcon />
            <span>Back to Projects</span>
          </button>
          {allProjects.map((p, i) => (
            <button
              key={p.id}
              className={`sidebar-project ${p.id === project.id ? "active" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => onSelectProject(p)}
            >
              <div className="sidebar-tab" aria-hidden="true" />
              <span>{p.name}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="detail-content">
          <h2 className="detail-title">{project.name}</h2>

          <div className="detail-panels">
            {/* Feedback Queue */}
            <div className="queue-panel">
              <div className="queue-header">
                <h3>Feedback Queue</h3>
                <div className="filter-row">
                  <FilterIcon />
                  <select
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {["All Status", "Not Started", "Ongoing", "Finished"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="feedback-list">
                {filtered.length === 0 && (
                  <div className="empty-state">No feedback matching filter</div>
                )}
                {filtered.map((f, i) => (
                  <button
                    key={f.id}
                    className={`feedback-item ${selectedFeedback?.id === f.id ? "selected" : ""}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                    onClick={() => setSelectedFeedback(f)}
                  >
                    <div className="feedback-item-top">
                      <span className="feedback-item-title">{f.title}</span>
                      <span className="feedback-item-date">{f.receivedAt}</span>
                    </div>
                    <div className="feedback-item-sub">
                      <span>From: {f.from}</span>
                    </div>
                    <p className="feedback-item-summary">{f.summary}</p>
                    <div className="feedback-item-footer">
                      <span
                        className={`priority-badge ${PRIORITY_COLORS[f.priority]}`}
                      >
                        {f.priority.charAt(0).toUpperCase() +
                          f.priority.slice(1)}{" "}
                        Priority
                      </span>
                      <span className={statusPillStageClass(f.status)}>
                        {STATUS_LABELS[f.status]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="detail-panel">
              {selectedFeedback ? (
                <FeedbackDetail feedback={selectedFeedback} />
              ) : (
                <div className="empty-state">Select a feedback item</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 3.5L6 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeedbackDetail({ feedback }: { feedback: Feedback }) {
  const [status, setStatus] = useState<"not-started" | "ongoing" | "finished">(
    feedbackToUiStage(feedback.status),
  );

  const PIPELINE: Array<"not-started" | "ongoing" | "finished"> = [
    "not-started",
    "ongoing",
    "finished",
  ];
  const currentIdx = PIPELINE.indexOf(status);

  useEffect(() => {
    setStatus(feedbackToUiStage(feedback.status));
  }, [feedback]);

  const advance = () => {
    if (currentIdx < PIPELINE.length - 1) {
      setStatus(PIPELINE[currentIdx + 1]);
    }
  };

  return (
    <div className="feedback-detail-inner">
      <div className="feedback-detail-header">
        <h3 className="feedback-detail-title">{feedback.title}</h3>
        <span
          className={`priority-badge ${PRIORITY_COLORS[feedback.priority]}`}
        >
          {feedback.priority.charAt(0).toUpperCase() +
            feedback.priority.slice(1)}{" "}
          Priority
        </span>
      </div>

      <div className="feedback-detail-meta">
        <div className="meta-row">
          <MailIconSm />
          <span>From: {feedback.from}</span>
        </div>
        <div className="meta-row">
          <CalendarIcon />
          <span>Received: {feedback.receivedAt}</span>
        </div>
        <div className="meta-row">
          <CodeIcon />
          <span>Project: Clanker</span>
        </div>
      </div>

      <div className="detail-divider" />

      {/* Pipeline */}
      <div className="pipeline">
        {PIPELINE.map((step, i) => (
          <div
            key={step}
            className={`pipeline-step ${i <= currentIdx ? "done" : ""} ${i === currentIdx ? "current" : ""}`}
          >
            <div className="pipeline-dot">
              {i < currentIdx && <CheckIcon />}
              {i === currentIdx && <div className="pipeline-pulse" />}
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className={`pipeline-line ${i < currentIdx ? "filled" : ""}`}
              />
            )}
            <span className="pipeline-label">
              {step === "not-started"
                ? "Not Started"
                : step === "ongoing"
                  ? "Ongoing"
                  : "Finished"}
            </span>
          </div>
        ))}
      </div>

      {status !== "finished" && (
        <button className="advance-btn" onClick={advance}>
          Advance →{" "}
          {PIPELINE[currentIdx + 1] === "not-started"
            ? "Not Started"
            : PIPELINE[currentIdx + 1] === "ongoing"
              ? "Ongoing"
              : "Finished"}
        </button>
      )}

      <div className="detail-divider" />

      <div className="detail-section">
        <h4>Feedback Content</h4>
        <p>{feedback.content}</p>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 4h12M4 8h8M6 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="4"
        width="12"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M2 5.5l6 4 6-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M2 7h12M6 2v2M10 2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path
        d="M5 6L2 8l3 2M11 6l3 2-3 2M9 4l-2 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import type { Project, Feedback } from "../page";

interface Props {
  project: Project;
  allProjects: Project[];
  feedback: Feedback[];
  onSelectProject: (p: Project) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  implementing: "Implementing",
  testing: "Testing",
  staged: "Staged",
  done: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

export default function ProjectDetailView({ project, allProjects, feedback, onSelectProject }: Props) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(feedback[0] ?? null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = statusFilter === "All Status"
    ? feedback
    : feedback.filter((f) => STATUS_LABELS[f.status] === statusFilter);

  return (
    <div className={`view detail-view ${mounted ? "mounted" : ""}`}>
      <Navbar />
      <div className="detail-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {allProjects.map((p, i) => (
            <button
              key={p.id}
              className={`sidebar-project ${p.id === project.id ? "active" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => onSelectProject(p)}
            >
              <div className="sidebar-tab" />
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
                    {["All Status", "Pending", "Implementing", "Testing", "Staged", "Done"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
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
                      <span>{f.estimatedTime}</span>
                    </div>
                    <p className="feedback-item-summary">{f.summary}</p>
                    <div className="feedback-item-footer">
                      <span className={`priority-badge ${PRIORITY_COLORS[f.priority]}`}>
                        {f.priority.charAt(0).toUpperCase() + f.priority.slice(1)} Priority
                      </span>
                      <span className={`status-pill status-${f.status}`}>
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

function FeedbackDetail({ feedback }: { feedback: Feedback }) {
  const [status, setStatus] = useState(feedback.status);

  const PIPELINE = ["pending", "implementing", "testing", "staged", "done"];
  const currentIdx = PIPELINE.indexOf(status);

  const advance = () => {
    if (currentIdx < PIPELINE.length - 1) {
      setStatus(PIPELINE[currentIdx + 1] as Feedback["status"]);
    }
  };

  return (
    <div className="feedback-detail-inner">
      <div className="feedback-detail-header">
        <h3 className="feedback-detail-title">{feedback.title}</h3>
        <span className={`priority-badge ${PRIORITY_COLORS[feedback.priority]}`}>
          {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)} Priority
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
          <div key={step} className={`pipeline-step ${i <= currentIdx ? "done" : ""} ${i === currentIdx ? "current" : ""}`}>
            <div className="pipeline-dot">
              {i < currentIdx && <CheckIcon />}
              {i === currentIdx && <div className="pipeline-pulse" />}
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={`pipeline-line ${i < currentIdx ? "filled" : ""}`} />
            )}
            <span className="pipeline-label">{STATUS_LABELS[step]}</span>
          </div>
        ))}
      </div>

      {status !== "done" && (
        <button className="advance-btn" onClick={advance}>
          Advance → {STATUS_LABELS[PIPELINE[currentIdx + 1]] ?? ""}
        </button>
      )}

      <div className="detail-divider" />

      <div className="detail-section">
        <h4>Feedback Content</h4>
        <p>{feedback.content}</p>
      </div>

      <div className="detail-section">
        <h4>Estimated Implementation Time</h4>
        <p>{feedback.estimatedTime}</p>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function MailIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M2 7h12M6 2v2M10 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M5 6L2 8l3 2M11 6l3 2-3 2M9 4l-2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
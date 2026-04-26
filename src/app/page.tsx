"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProjectDetailView from "@/components/ProjectDetailView";
import { MOCK_FEEDBACK, MOCK_PROJECTS, type Project } from "../lib/data";
import styles from "./page.module.css";

const STATUS_LABEL: Record<Project["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  paused: "Paused",
};

function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status === "active" && <span className={styles.badgeDot} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.folderWrap} ${project.status === "inactive" ? styles.dimmed : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onOpen(project)}
    >
      <span className={styles.folderTab} aria-hidden />
      <div className={styles.folderBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <BranchIcon />
            <span>{project.branch}</span>
          </div>
          <div className={styles.metaItem}>
            <MailIcon />
            <span>{project.email}</span>
          </div>
        </div>

        {project.feedbackCount > 0 && (
          <div className={styles.feedbackLine}>
            <span className={styles.countDot} />
            <span>{project.feedbackCount} pending</span>
          </div>
        )}
      </div>
    </button>
  );
}

function BranchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a4 4 0 0 0-3.9 3.1A1 1 0 0 0 2 14h6a1 1 0 0 0 .9-1.9A4 4 0 0 0 5 9zm6-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M11 7v2M5 7v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 9a2 2 0 0 1-2 2H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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

export default function ProjectsPage() {
  const [selected, setSelected] = useState<Project | null>(null);

  const feedbackForProject = useMemo(() => {
    if (!selected) return [];
    return MOCK_FEEDBACK.filter((f) => f.project === selected.name);
  }, [selected]);

  if (selected) {
    return (
      <ProjectDetailView
        project={selected}
        allProjects={MOCK_PROJECTS}
        feedback={feedbackForProject}
        onSelectProject={setSelected}
        onBackToProjects={() => setSelected(null)}
      />
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Your Projects</h1>

          <div className={styles.grid}>
            {MOCK_PROJECTS.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onOpen={setSelected}
              />
            ))}
            <button
              type="button"
              className={`${styles.folderWrap} ${styles.addFolder}`}
              style={{ animationDelay: `${MOCK_PROJECTS.length * 60}ms` }}
            >
              <span className={styles.folderTab} aria-hidden />
              <div className={`${styles.folderBody} ${styles.addFolderBody}`}>
                <div className={styles.addIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span>New Project</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

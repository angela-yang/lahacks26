"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import { registerProject } from "@/app/actions/projects";
import {
  type GitHubRepo,
  type Project,
} from "@/lib/data";
import styles from "../page.module.css";

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
  href,
}: {
  project: Project;
  index: number;
  href: string;
}) {
  const nameSize = getAdaptiveTextSize(project.name, 1.15, 0.93);
  const branchSize = getAdaptiveTextSize(project.branch, 0.98, 0.82);
  const emailSize = getAdaptiveTextSize(project.email, 0.98, 0.8);
  const repoSize = getAdaptiveTextSize(project.githubRepo, 0.98, 0.8);

  return (
    <Link
      href={href}
      className={`${styles.folderWrap} ${project.status === "inactive" ? styles.dimmed : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className={styles.folderTab} aria-hidden />
      <div className={styles.folderBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName} style={nameSize ? { fontSize: nameSize } : undefined}>
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <BranchIcon />
            <span style={branchSize ? { fontSize: branchSize } : undefined}>
              {project.branch}
            </span>
          </div>
          <div className={styles.metaItem}>
            <MailIcon />
            <span style={emailSize ? { fontSize: emailSize } : undefined}>
              {project.email}
            </span>
          </div>
          <div className={styles.metaItem}>
            <RepoIcon />
            <span style={repoSize ? { fontSize: repoSize } : undefined}>
              {project.githubRepo}
            </span>
          </div>
        </div>

        {project.feedbackCount > 0 && (
          <div className={styles.feedbackLine}>
            <span className={styles.countDot} />
            <span>{project.feedbackCount} pending</span>
          </div>
        )}
      </div>
    </Link>
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

function RepoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 2.5h6A1.5 1.5 0 0 1 12.5 4v8A1.5 1.5 0 0 1 11 13.5H5A1.5 1.5 0 0 1 3.5 12V4A1.5 1.5 0 0 1 5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.65"
      />
      <path
        d="M5.8 6h4.4M5.8 8h3M5.8 10h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatProjectName(repo: GitHubRepo) {
  return repo.name
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createProjectId() {
  return `project-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getRelativeActivityMinutes(lastActivity: string) {
  const value = lastActivity.trim().toLowerCase();

  if (value === "just now") return 0;

  const match = value.match(
    /^(\d+)\s+(min|mins|minute|minutes|hr|hrs|hour|hours|day|days|week|weeks|month|months)\s+ago$/,
  );

  if (!match) return Number.POSITIVE_INFINITY;

  const amount = Number(match[1]);
  const unit = match[2];

  const factor: Record<string, number> = {
    min: 1,
    mins: 1,
    minute: 1,
    minutes: 1,
    hr: 60,
    hrs: 60,
    hour: 60,
    hours: 60,
    day: 60 * 24,
    days: 60 * 24,
    week: 60 * 24 * 7,
    weeks: 60 * 24 * 7,
    month: 60 * 24 * 30,
    months: 60 * 24 * 30,
  };

  return amount * factor[unit];
}

function getAdaptiveTextSize(text: string, base: number, min: number) {
  const length = text.trim().length;

  if (length <= 22) return undefined;

  const scaled = Math.max(min, base - (length - 22) * 0.017);
  return `${scaled}rem`;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Project["status"]>("all");
  const [sortBy, setSortBy] = useState<"recent" | "pending">("recent");
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [githubReposLoading, setGithubReposLoading] = useState(true);
  const [githubReposError, setGithubReposError] = useState<string | null>(null);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState("");

  const visibleProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => {
        if (statusFilter !== "all" && project.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        const haystack = [
          project.name,
          project.email,
          project.branch,
          project.githubRepo,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === "pending") {
          const pendingDelta = b.project.feedbackCount - a.project.feedbackCount;
          if (pendingDelta !== 0) return pendingDelta;

          const activityDelta =
            getRelativeActivityMinutes(a.project.lastActivity) -
            getRelativeActivityMinutes(b.project.lastActivity);
          if (activityDelta !== 0) return activityDelta;
        } else {
          const activityDelta =
            getRelativeActivityMinutes(a.project.lastActivity) -
            getRelativeActivityMinutes(b.project.lastActivity);
          if (activityDelta !== 0) return activityDelta;

          const pendingDelta = b.project.feedbackCount - a.project.feedbackCount;
          if (pendingDelta !== 0) return pendingDelta;
        }

        return a.index - b.index;
      })
      .map(({ project }) => project);
  }, [projects, searchQuery, sortBy, statusFilter]);

  const selectedRepo = useMemo(
    () =>
      githubRepos.find((repo) => repo.fullName === selectedRepoFullName) ??
      githubRepos[0] ??
      null,
    [githubRepos, selectedRepoFullName],
  );

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        setGithubReposLoading(true);
        setGithubReposError(null);

        const [reposResponse, projectsResponse] = await Promise.all([
          fetch("/api/github/repos", { cache: "no-store" }),
          fetch("/api/projects", { cache: "no-store" }),
        ]);

        const reposPayload = (await reposResponse.json()) as {
          repositories?: GitHubRepo[];
          error?: string;
        };

        if (!reposResponse.ok) {
          throw new Error(
            reposPayload.error ?? "Failed to load GitHub repositories.",
          );
        }

        if (!isActive) return;

        const repos = reposPayload.repositories ?? [];
        setGithubRepos(repos);
        setSelectedRepoFullName((current) => current || repos[0]?.fullName || "");

        if (projectsResponse.ok) {
          const projectsPayload = (await projectsResponse.json()) as {
            projects?: Project[];
          };
          if (isActive) {
            setProjects(projectsPayload.projects ?? []);
          }
        }
      } catch (error) {
        if (!isActive) return;

        setGithubRepos([]);
        setSelectedRepoFullName("");
        setGithubReposError(
          error instanceof Error
            ? error.message
            : "Failed to load GitHub repositories.",
        );
      } finally {
        if (isActive) {
          setGithubReposLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isCreateModalOpen]);

  const openCreateModal = () => {
    setClientEmail("");
    setSelectedRepoFullName(githubRepos[0]?.fullName ?? "");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => setIsCreateModalOpen(false);

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRepo) return;

    const projectName = formatProjectName(selectedRepo);
    const email = clientEmail.trim();

    // Optimistic update with a temp id; replaced when server action resolves
    const tempId = createProjectId();
    const optimisticProject: Project = {
      id: tempId,
      name: projectName,
      branch: "main",
      email,
      githubRepo: selectedRepo.fullName,
      status: "active",
      feedbackCount: 0,
      lastActivity: "just now",
      tech: [],
    };

    setProjects((current) => [optimisticProject, ...current]);
    setIsCreateModalOpen(false);
    setClientEmail("");
    setSelectedRepoFullName(githubRepos[0]?.fullName ?? "");

    const realId = await registerProject(selectedRepo.fullName, email, projectName);
    setProjects((current) =>
      current.map((p) => (p.id === tempId ? { ...p, id: realId } : p)),
    );
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Your Projects</h1>

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <span>Search</span>
              <input
                type="search"
                placeholder="Search by project, email, branch, or repo"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className={styles.selectField}>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | Project["status"])
                }
              >
                <option value="all">All projects</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className={styles.selectField}>
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "recent" | "pending")
                }
              >
                <option value="recent">Most recent task</option>
                <option value="pending">Most pending tasks</option>
              </select>
            </label>
          </div>

          <div className={styles.grid}>
            {visibleProjects.length > 0 ? (
              visibleProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  href={`/projects/${p.id}?from=dashboard`}
                />
              ))
            ) : (
              <div className={styles.emptyState}>No projects match your search.</div>
            )}
            <button
              type="button"
              className={`${styles.folderWrap} ${styles.addFolder}`}
              style={{ animationDelay: `${visibleProjects.length * 60}ms` }}
              onClick={openCreateModal}
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

      {isCreateModalOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={closeCreateModal}
        >
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            aria-describedby="create-project-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Create project</p>
                <h2 id="create-project-title" className={styles.modalTitle}>
                  New project setup
                </h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={closeCreateModal}
                aria-label="Close create project dialog"
              >
                ×
              </button>
            </div>

            <p id="create-project-description" className={styles.modalDescription}>
              Connect a client email with one of the GitHub repositories linked
              to the signed-in Clerk account.
            </p>

            <form className={styles.modalForm} onSubmit={handleCreateProject}>
              <label className={styles.field}>
                <span>Client email</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="client@company.com"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>GitHub repository</span>
                <select
                  name="repo"
                  required
                  value={selectedRepoFullName}
                  onChange={(event) =>
                    setSelectedRepoFullName(event.target.value)
                  }
                  disabled={githubReposLoading || githubRepos.length === 0}
                >
                  {githubReposLoading && (
                    <option value="">Loading repositories…</option>
                  )}
                  {!githubReposLoading && githubRepos.length === 0 && (
                    <option value="">No repositories available</option>
                  )}
                  {githubRepos.map((repo) => (
                    <option key={repo.id} value={repo.fullName}>
                      {repo.fullName} {repo.private ? "· Private" : "· Public"}
                    </option>
                  ))}
                </select>
              </label>

              {githubReposError && (
                <p className={styles.modalError}>{githubReposError}</p>
              )}

              <div className={styles.repoPreview}>
                <span className={styles.repoPreviewLabel}>Project name preview</span>
                <span className={styles.repoPreviewValue}>
                  {selectedRepo ? formatProjectName(selectedRepo) : "—"}
                </span>
                <span className={styles.repoPreviewMeta}>
                  {selectedRepo?.fullName ?? "No repository selected"}
                </span>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalSecondaryButton}
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalPrimaryButton}
                  disabled={!selectedRepo}
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

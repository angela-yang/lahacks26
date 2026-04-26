"use client";

import Link from "next/link";
import { use } from "react";
import ProjectDetailView from "@/components/ProjectDetailView";
import { MOCK_FEEDBACK, MOCK_PROJECTS } from "@/lib/data";

export default function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const { id } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  const animateSidebar = resolvedSearchParams?.from === "dashboard";
  const project = MOCK_PROJECTS.find((candidate) => candidate.id === id) ?? null;

  if (!project) {
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

  const feedback = MOCK_FEEDBACK.filter((entry) => entry.project === project.name);

  return (
    <ProjectDetailView
      project={project}
      allProjects={MOCK_PROJECTS}
      feedback={feedback}
      animateSidebar={animateSidebar}
    />
  );
}

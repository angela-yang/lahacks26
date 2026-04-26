"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import type { Project } from "../lib/data";

interface Props {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

export default function ProjectsView({ projects, onSelectProject }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`view projects-view ${mounted ? "mounted" : ""}`}>
      <Navbar />
      <main className="projects-main">
        <h1 className="section-title">Your Projects</h1>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <button
              key={project.id}
              className={`project-card ${project.status === "inactive" ? "inactive" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => onSelectProject(project)}
            >
              <div className="project-card-tab" />
              <div className="project-card-inner">
                <div className="project-card-header">
                  <span className="project-name">{project.name}</span>
                  <span className={`status-badge ${project.status}`}>
                    {project.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="project-meta">
                  <div className="meta-row">
                    <BranchIcon />
                    <span>{project.branch}</span>
                  </div>
                  <div className="meta-row">
                    <MailIcon />
                    <span>{project.email}</span>
                  </div>
                </div>
                {project.feedbackCount > 0 && (
                  <div className="feedback-count">
                    <span className="count-dot" />
                    <span>{project.feedbackCount} pending</span>
                  </div>
                )}
              </div>
            </button>
          ))}
          <button className="project-card add-card">
            <div className="project-card-inner add-inner">
              <div className="add-icon">+</div>
              <span>New Project</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

function BranchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a4 4 0 0 0-3.9 3.1A1 1 0 0 0 2 14h6a1 1 0 0 0 .9-1.9A4 4 0 0 0 5 9zm6-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor" opacity="0.6"/>
      <path d="M11 7v2M5 7v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 9a2 2 0 0 1-2 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
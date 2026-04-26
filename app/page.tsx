"use client";

import { useState } from "react";
import ProjectsView from "./components/ProjectsView";
import ProjectDetailView from "./components/ProjectDetailView";

export type Project = {
  id: string;
  name: string;
  branch: string;
  email: string;
  status: "active" | "inactive";
  feedbackCount: number;
};

export type Feedback = {
  id: string;
  projectId: string;
  title: string;
  from: string;
  receivedAt: string;
  priority: "high" | "low" | "medium";
  estimatedTime: string;
  content: string;
  summary: string;
  status: "pending" | "implementing" | "testing" | "staged" | "done";
};

const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Project 1", branch: "main", email: "example@gmail.com", status: "active", feedbackCount: 3 },
  { id: "p2", name: "Project 2", branch: "main", email: "example@gmail.com", status: "active", feedbackCount: 1 },
  { id: "p3", name: "Project 3", branch: "main", email: "example@gmail.com", status: "active", feedbackCount: 5 },
  { id: "p4", name: "Project 4", branch: "main", email: "example@gmail.com", status: "inactive", feedbackCount: 0 },
];

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: "f1", projectId: "p1", title: "Feedback lalalla", from: "example@gmail.com",
    receivedAt: "2026-04-25 10:30 AM", priority: "high", estimatedTime: "2–4 hours",
    content: "Lalallalallala here is some feedback that I want improved pls",
    summary: "Lalallalallala here is a feedback summary yay", status: "pending",
  },
  {
    id: "f2", projectId: "p1", title: "Feedback 2", from: "example@gmail.com",
    receivedAt: "2026-04-25 10:30 AM", priority: "low", estimatedTime: "1–2 hours",
    content: "Lalallalallala here is another feedback that needs fixing asap thank you",
    summary: "Lalallalallala here is another feedback summary yay", status: "implementing",
  },
  {
    id: "f3", projectId: "p1", title: "Navigation bug fix", from: "client@acme.com",
    receivedAt: "2026-04-24 02:15 PM", priority: "medium", estimatedTime: "3–5 hours",
    content: "The navigation bar breaks on mobile when the sidebar is open.",
    summary: "Mobile nav bar conflicts with sidebar overlay.", status: "staged",
  },
  {
    id: "f4", projectId: "p2", title: "Dark mode toggle", from: "example@gmail.com",
    receivedAt: "2026-04-25 09:00 AM", priority: "low", estimatedTime: "1 hour",
    content: "Please add a dark mode toggle to the settings page.",
    summary: "Add dark mode toggle to settings.", status: "testing",
  },
  {
    id: "f5", projectId: "p3", title: "Performance issue on dashboard", from: "stakeholder@corp.com",
    receivedAt: "2026-04-25 08:00 AM", priority: "high", estimatedTime: "4–6 hours",
    content: "Dashboard loads extremely slowly when there are more than 100 items.",
    summary: "Dashboard pagination or lazy-loading needed.", status: "pending",
  },
];

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="app-root">
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          allProjects={MOCK_PROJECTS}
          feedback={MOCK_FEEDBACK.filter((f) => f.projectId === selectedProject.id)}
          onSelectProject={setSelectedProject}
        />
      ) : (
        <ProjectsView projects={MOCK_PROJECTS} onSelectProject={setSelectedProject} />
      )}
    </div>
  );
}
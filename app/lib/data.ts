export type Priority = 'high' | 'medium' | 'low'
export type FeedbackStatus = 'queued' | 'implementing' | 'testing' | 'staging' | 'deployed' | 'rejected'
export type ProjectStatus = 'active' | 'inactive' | 'paused'

export interface Feedback {
  id: string
  title: string
  summary: string
  content: string
  from: string
  receivedAt: string
  priority: Priority
  status: FeedbackStatus
  estimatedTime: string
  project: string
  logs?: string[]
}

export interface Project {
  id: string
  name: string
  branch: string
  email: string
  status: ProjectStatus
  feedbackCount: number
  lastActivity: string
  tech: string[]
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    branch: 'main',
    email: 'example@gmail.com',
    status: 'active',
    feedbackCount: 3,
    lastActivity: '2 min ago',
    tech: [],
  },
  {
    id: '2',
    name: 'Project 2',
    branch: 'main',
    email: 'hello@example.com',
    status: 'active',
    feedbackCount: 1,
    lastActivity: '18 min ago',
    tech: [],
  },
  {
    id: '3',
    name: 'Project 3',
    branch: 'staging',
    email: 'noreply@example.com',
    status: 'active',
    feedbackCount: 0,
    lastActivity: '1 hr ago',
    tech: [],
  },
  {
    id: '4',
    name: 'Project 4',
    branch: 'main',
    email: 'team@example.com',
    status: 'inactive',
    feedbackCount: 0,
    lastActivity: '3 days ago',
    tech: [],
  },
]

export const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    title: 'Dashboard chart is broken on mobile',
    summary: 'The analytics chart overflows on screens smaller than 768px and hides the legend.',
    content: 'Hi team — just noticed the dashboard analytics chart completely breaks on mobile. The chart overflows past the container edge and the legend disappears. I checked on iPhone 14 and Samsung S23. This is blocking a few of our users from reviewing their weekly stats. Can this be prioritized?',
    from: 'sarah@acmecorp.com',
    receivedAt: '2026-04-25 10:30 AM',
    priority: 'high',
    status: 'implementing',
    estimatedTime: '2–3 hours',
    project: 'Project 1',
    logs: [
      '→ Fetched email via IMAP',
      '→ Classified as UI bug, priority: high',
      '→ Identified affected component: /components/charts/AnalyticsChart.tsx',
      '→ Patching chart container with responsive breakpoints...',
    ],
  },
  {
    id: 'f2',
    title: 'Add CSV export to reports page',
    summary: 'Users want to download report data as a CSV file for external analysis.',
    content: 'Could we add a CSV export button to the reports page? Our finance team needs to pull data into Excel for quarterly reviews. Even a simple download of the current table view would be super helpful.',
    from: 'mark@acmecorp.com',
    receivedAt: '2026-04-25 09:15 AM',
    priority: 'medium',
    status: 'queued',
    estimatedTime: '1–2 hours',
    project: 'Project 1',
  },
  {
    id: 'f3',
    title: 'Login page loading state missing',
    summary: 'No visual feedback when the sign-in button is clicked.',
    content: 'When you click sign in, nothing happens visually for a few seconds. Users think it\'s broken and click again. Please add a loading spinner or some kind of feedback.',
    from: 'james@acmecorp.com',
    receivedAt: '2026-04-24 04:00 PM',
    priority: 'low',
    status: 'testing',
    estimatedTime: '30 min',
    project: 'Project 1',
    logs: [
      '→ Fetched email via IMAP',
      '→ Classified as UX issue, priority: low',
      '→ Located: /pages/auth/login.tsx',
      '→ Added loading state to submit button',
      '→ Running test suite...',
      '✓ 24/24 tests passed',
      '→ Staging for review...',
    ],
  },
  {
    id: 'f4',
    title: 'Hero section copy update',
    summary: 'Update landing page headline and subtext per new brand guidelines.',
    content: 'New brand guidelines are attached. Please update the hero headline to "Design That Speaks" and replace the subtext with the new value prop copy from the doc.',
    from: 'dev@luminary.io',
    receivedAt: '2026-04-25 11:00 AM',
    priority: 'medium',
    status: 'staging',
    estimatedTime: '20 min',
    project: 'Project 2',
    logs: [
      '→ Fetched email via IMAP',
      '→ Classified as content change',
      '→ Updated: /pages/index.tsx hero section',
      '✓ Visual diff passed',
      '→ Staged to preview.luminary.io',
    ],
  },
]

import type { DashboardData } from '../types/dashboard'

/** Seed / mock — replace with context or API wiring later */
export const mockDashboardData: DashboardData = {
  researchQuestion: {
    mainQuestion:
      'How do independent venue operators build and sustain trust with artists and audiences in a fragmented digital booking landscape?',
    subQuestions: [
      'What informal channels do venues rely on when platform tools fall short?',
      'How is “reliability” negotiated between peers versus formal contracts?',
    ],
    researchAim:
      'To describe trust as a social practice in small-scale live music ecosystems—not only as a platform design problem.',
  },
  currentFocus: {
    label: 'Preparing for venue interviews',
    description:
      'Finalising prompts on informal knowledge-sharing and peer referral before the next site visits.',
  },
  interviewProgress: {
    planned: 8,
    completed: 3,
    analysed: 1,
  },
  questionBank: {
    total: 24,
    refined: 14,
    final: 6,
  },
  insights: [
    {
      id: 'ins-1',
      text: 'Booking knowledge is often learned informally from peers rather than from platform documentation.',
      createdAtLabel: 'Yesterday',
    },
    {
      id: 'ins-2',
      text: 'Trust appears to be socially mediated rather than platform-based when capacity is tight.',
      createdAtLabel: '3 days ago',
    },
    {
      id: 'ins-3',
      text: 'Operators describe “a good room” in relational terms—repeat relationships, not metrics.',
      createdAtLabel: 'Last week',
    },
  ],
  upcomingInterview: {
    id: 'int-1',
    name: 'Maya Okonkwo',
    organisation: 'Northline Studio Collective',
    venue: 'Warehouse rehearsal space',
    dateTimeLabel: 'Thursday 27 March · 14:30',
    statusLabel: 'Confirmed',
  },
}

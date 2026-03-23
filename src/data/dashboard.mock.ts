import type { DashboardData } from '../types/dashboard'

/** Optional mock dashboard payload — not wired on the home page (research question uses project context). */
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
}

import {
  CurrentFocusSection,
  InterviewProgressSection,
  QuestionBankSnapshotSection,
  RecentInsightsSection,
  ResearchQuestionSection,
  UpcomingInterviewSection,
} from '../components/dashboard'
import { GreetingBar } from '../components/layout/GreetingBar'
import { mockDashboardData } from '../data/dashboard.mock'

/**
 * Lumen home — calm research desk. Data from mock; swap for store/API later.
 */
export function Dashboard() {
  const data = mockDashboardData

  return (
    <div className="space-y-8 md:space-y-10">
      <GreetingBar />
      <ResearchQuestionSection data={data.researchQuestion} />

      <CurrentFocusSection data={data.currentFocus} />

      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
        <InterviewProgressSection data={data.interviewProgress} />
        <QuestionBankSnapshotSection data={data.questionBank} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
        <RecentInsightsSection insights={data.insights} />
        <UpcomingInterviewSection interview={data.upcomingInterview} />
      </div>
    </div>
  )
}

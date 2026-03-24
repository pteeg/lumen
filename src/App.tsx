import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { InterviewGuideWorkspaceProvider } from './context/InterviewGuideWorkspaceContext'
import { ResearchProvider } from './context/ResearchContext'
import { Dashboard } from './pages/Dashboard'
import { FindingsIndexPage } from './pages/findings/FindingsIndexPage'
import { FindingsLayout } from './pages/findings/FindingsLayout'
import { FindingsParticipantPage } from './pages/findings/FindingsParticipantPage'
import { InterviewsLayout } from './pages/interviews/InterviewsLayout'
import { InterviewsCalendar } from './pages/interviews/InterviewsCalendar'
import { InterviewsOverview } from './pages/interviews/InterviewsOverview'
import { InterviewsParticipation } from './pages/interviews/InterviewsParticipation'
import { InterviewsStructure } from './pages/interviews/InterviewsStructure'
import { WriteUpLayout } from './pages/write-up/WriteUpLayout'
import { TasksPage } from './pages/TasksPage'
import { Thesis } from './pages/Thesis'
import { WriteUpSectionPage } from './pages/write-up/WriteUpSectionPage'

export default function App() {
  return (
    <ResearchProvider>
      <InterviewGuideWorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="thesis" element={<Thesis />} />
              <Route path="interviews" element={<InterviewsLayout />}>
                <Route index element={<InterviewsOverview />} />
                <Route
                  path="overview"
                  element={<Navigate to="/interviews" replace />}
                />
                <Route path="structure" element={<InterviewsStructure />} />
                <Route
                  path="participation"
                  element={<InterviewsParticipation />}
                />
                <Route path="calendar" element={<InterviewsCalendar />} />
              </Route>
              <Route path="findings" element={<FindingsLayout />}>
                <Route index element={<FindingsIndexPage />} />
                <Route
                  path=":participantId"
                  element={<FindingsParticipantPage />}
                />
              </Route>
              <Route path="write-up" element={<WriteUpLayout />}>
                <Route
                  index
                  element={<Navigate to="overview" replace />}
                />
                <Route path=":section" element={<WriteUpSectionPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </InterviewGuideWorkspaceProvider>
    </ResearchProvider>
  )
}

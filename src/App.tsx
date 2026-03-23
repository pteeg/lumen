import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ResearchProvider } from './context/ResearchContext'
import { Dashboard } from './pages/Dashboard'
import { Findings } from './pages/Findings'
import { InterviewsLayout } from './pages/interviews/InterviewsLayout'
import { InterviewsOverview } from './pages/interviews/InterviewsOverview'
import { InterviewsStructure } from './pages/interviews/InterviewsStructure'
import { WriteUp } from './pages/WriteUp'

export default function App() {
  return (
    <ResearchProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="interviews" element={<InterviewsLayout />}>
              <Route index element={<InterviewsStructure />} />
              <Route path="overview" element={<InterviewsOverview />} />
            </Route>
            <Route path="findings" element={<Findings />} />
            <Route path="write-up" element={<WriteUp />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ResearchProvider>
  )
}

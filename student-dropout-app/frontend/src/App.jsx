import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import StudentDetail from './pages/StudentDetail'
import UploadPage from './pages/UploadPage'
import FeedbackPage from './pages/FeedbackPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"               element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/student/:name"  element={<StudentDetail />} />
            <Route path="/upload"         element={<UploadPage />} />
            <Route path="/feedback/:id"   element={<FeedbackPage />} />
            <Route path="*"               element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

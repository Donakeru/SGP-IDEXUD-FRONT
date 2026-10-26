import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout'
import NewProposal from '../pages/dashboard/NewProposal'
import Home from '../pages/dashboard/Home'
import Proposal from '../pages/dashboard/Proposal'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="proposals/new" element={<NewProposal />} />
          <Route path="proposals" element={<Proposal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

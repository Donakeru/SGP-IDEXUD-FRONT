import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layout/DashboardLayout'
import NewProposal from '../pages/dashboard/NewProposal'
import Home from '../pages/dashboard/Home'
import Login from '../pages/Login'
import Proposal from '../pages/dashboard/Proposal'
import ProposalDetail from '../pages/dashboard/ProposalDetail'
import Review from '../pages/dashboard/Review'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="proposals/new" element={<NewProposal />} />
          <Route path="proposals" element={<Proposal />} />
          <Route path="proposals/detail" element={<ProposalDetail />} />
          <Route path="review" element={<Review />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

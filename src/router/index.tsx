import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RequireCapability from '../components/auth/RequireCapability'
import DashboardLayout from '../layout/DashboardLayout'
import NewProposal from '../pages/dashboard/NewProposal'
import Home from '../pages/dashboard/Home'
import Login from '../pages/Login'
import Proposal from '../pages/dashboard/Proposal'
import ProposalDetail from '../pages/dashboard/ProposalDetail'
import Review from '../pages/dashboard/Review'
import { DASHBOARD_BASE, appRoutes, type RouteId } from './routeConfig'

const routeElements: Record<RouteId, ReactNode> = {
  home: <Home />,
  proposals: <Proposal />,
  'proposal-detail': <ProposalDetail />,
  'proposal-new': <NewProposal />,
  review: <Review />,
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path={DASHBOARD_BASE} element={<DashboardLayout />}>
            {appRoutes.map((route) => {
              const element = (
                <RequireCapability capability={route.capability}>
                  {routeElements[route.id]}
                </RequireCapability>
              )

              return route.path ? (
                <Route key={route.id} path={route.path} element={element} />
              ) : (
                <Route key={route.id} index element={element} />
              )
            })}
            <Route path="*" element={<Navigate to={DASHBOARD_BASE} replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={DASHBOARD_BASE} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

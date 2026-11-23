import AuthProvider from './auth/AuthProvider'
import AuthModeBanner from './components/AuthModeBanner'
import ForbiddenAlertHost from './components/ForbiddenAlertHost'
import AppRouter from './router'

function App() {
  return (
    <>
      <AuthModeBanner />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ForbiddenAlertHost />
    </>
  )
}

export default App

import AuthProvider from './auth/AuthProvider'
import ForbiddenAlertHost from './components/ForbiddenAlertHost'
import AppRouter from './router'

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <ForbiddenAlertHost />
    </>
  )
}

export default App

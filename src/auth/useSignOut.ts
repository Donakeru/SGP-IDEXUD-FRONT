import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Cierra la sesión y lleva a /login sin "destino original": quien sale
 * voluntariamente no debe volver a la última pantalla al ingresar de nuevo.
 */
export function useSignOut() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useCallback(() => {
    navigate('/login', { replace: true })
    logout()
  }, [logout, navigate])
}

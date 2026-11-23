import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { appConfig, logStartupWarnings } from './config/env'
import './index.css'

logStartupWarnings(appConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App'
import LandingPage from './LandingPage'
import './styles.css'
import './landing.css'

globalThis.Buffer ||= Buffer

const isProductRoute = window.location.pathname.startsWith('/app')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isProductRoute ? <App /> : <LandingPage />}
  </React.StrictMode>,
)

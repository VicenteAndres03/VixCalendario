import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx' // 1. Importa el Provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> {/* 2. Envuelve tu App */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)
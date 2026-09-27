import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(220,20,20,0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: 'var(--bg-card)' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

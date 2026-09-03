import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AppStoreProvider } from './data/store'
import AuthGate from './components/AuthGate'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AppStoreProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AppStoreProvider>
    </HashRouter>
  </React.StrictMode>,
)

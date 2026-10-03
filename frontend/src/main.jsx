import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { installAuthInterceptors } from './utils/session'
import '@fontsource/changa-one'

installAuthInterceptors()

// After a redeploy, an open tab may request page files that no longer exist: reload once to get the new version
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  if (!sessionStorage.getItem('reloadedForUpdate')) {
    sessionStorage.setItem('reloadedForUpdate', '1')
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/fraunces/wght.css'
import './ui/index.css'
import App from './ui/App'

// Set theme before first paint (covers the artifact/standalone build, which has no
// index.html pre-paint script).
try {
  const raw = localStorage.getItem('future-map:v1')
  const stored = raw ? (JSON.parse(raw).state?.theme as string | undefined) : undefined
  const t =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
  document.documentElement.dataset.theme = t
  document.documentElement.style.colorScheme = t
} catch {
  document.documentElement.dataset.theme = 'dark'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

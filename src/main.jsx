import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { clearAuth } from './services/authService'

// Kiểm tra xem dev server có vừa được khởi chạy lại hay không (chạy lại lệnh npm run dev)
const lastBuildId = localStorage.getItem('api_fe_last_build_id')
const currentBuildId = import.meta.env.VITE_BUILD_ID

if (currentBuildId && lastBuildId !== String(currentBuildId)) {
  clearAuth()
  localStorage.setItem('api_fe_last_build_id', String(currentBuildId))
}

// Dọn dẹp dự án mẫu mặc định khỏi localStorage (chạy mỗi lần app khởi động)
;(function purgeDefaultProjects() {
  const MOCK_IDS = new Set(['mp-1', 'mp-2'])
  const KEYS = ['api_fe_projects', 'my_dashboard_projects', 'ai_projects_v2', 'ai_projects']
  KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const items = JSON.parse(raw)
      if (!Array.isArray(items)) return
      const cleaned = items.filter((p) => !MOCK_IDS.has(p.id))
      if (cleaned.length !== items.length) {
        localStorage.setItem(key, JSON.stringify(cleaned))
      }
    } catch {
      // Ignore JSON parse errors
    }
  })
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

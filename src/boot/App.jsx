import React from 'react'
import LobbyPage from './pages/LobbyPage'
import WaitingPage from './pages/WaitingPage'
import RacePage from './pages/RacePage'
import { AppProvider, useApp } from '../shared/contexts/AppContext'
import CustomCursor from '../shared/components/CustomCursor'

const AppContent = () => {
  const { currentPage } = useApp()
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-text font-text transition-colors duration-300">
      {currentPage === 'lobby' && <LobbyPage />}
      {currentPage === 'waiting' && <WaitingPage />}
      {currentPage === 'race' && <RacePage />}
      <CustomCursor
        color="#EC489A"
        size={24}
        activeSize={48}
        trailing={true}
        blendMode={false}
        outline={true}
        outlineColor="#FFFFFF"
      />
    </div>
  )
}

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
)

export default App
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { createRealSocket, SE } from '../services/SocketService'

const AppContext = createContext(null)

const STORAGE_KEYS = {
  PLAYER_NAME:  'tr3d_player_name',
  PLAYER_COLOR: 'tr3d_player_color',
  THEME:        'tr3d_theme',
}

const DEFAULT_COLOR = '#F92C44'

export const AppProvider = ({ children }) => {
  // ── Socket State ──────────────────────────────────────────
  const [socket, setSocket] = useState(null)
  const [roomState, setRoomState] = useState(null)

  // ── Navigation ────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState('lobby')
  const navigate = (page) => setCurrentPage(page)

  // ── Theme ─────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ── Player ────────────────────────────────────────────────
  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '')
  const [playerColor, setPlayerColorState] = useState(() => localStorage.getItem(STORAGE_KEYS.PLAYER_COLOR) || DEFAULT_COLOR)
  
  const setPlayerName = (name) => {
    setPlayerNameState(name)
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name)
  }

  // ── Jeu & Bots ────────────────────────────────────────────
  const [gameMode, setGameMode] = useState(null)
  const [selectedBots, setSelectedBots] = useState([])
  const [selectedCar, setSelectedCar] = useState('default')

  // ── Initialisation Socket ─────────────────────────────────
  useEffect(() => {
    const initSocket = async () => {
      try {
        const s = await createRealSocket()
        setSocket(s)

        s.on(SE.ROOM_JOINED, ({ state }) => {
          setRoomState(state)
          setCurrentPage('waiting')
        })

        s.on(SE.ROOM_UPDATE, (newState) => {
          setRoomState(newState)
        })

        s.on(SE.RACE_START, () => {
          setCurrentPage('race')
        })

        s.on(SE.ROOM_ERROR, (msg) => {
          alert(msg)
          setCurrentPage('lobby')
        })
      } catch (err) {
        console.error("Socket connection error:", err)
      }
    }
    initSocket()
  }, [])

  // ── Actions Multijoueur ───────────────────────────────────
  const createRoom = () => {
    if (!socket) return
    socket.emit(SE.CREATE_ROOM, { name: playerName, color: playerColor })
  }

  const joinRoom = (roomId) => {
    if (!socket || !roomId) return
    socket.emit(SE.JOIN_ROOM, { roomId, name: playerName, color: playerColor })
  }

  // Quitter une room sans tuer le socket — le serveur nettoie via l'event 'disconnect' puis reconnect
  const leaveRoom = () => {
    if (!socket) return
    setRoomState(null)
    setCurrentPage('lobby')
    // On déconnecte puis reconnecte pour que le serveur nettoie la room
    // et qu'on puisse en rejoindre/créer une nouvelle
    socket.disconnect()
    socket.connect()
  }

  return (
    <AppContext.Provider value={{
      socket,
      roomState,
      setRoomState, // ← exposé pour que WaitingView puisse faire setRoomState(null)
      currentPage, navigate,
      theme, toggleTheme,
      playerName, setPlayerName,
      playerColor, setPlayerColor: setPlayerColorState,
      gameMode, setGameMode,
      selectedBots, setSelectedBots,
      selectedCar, setSelectedCar,
      createRoom,
      joinRoom,
      leaveRoom,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider')
  return ctx
}
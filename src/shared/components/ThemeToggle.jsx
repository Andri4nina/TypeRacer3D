import React, { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="flex gap-1 items-center opacity-50 group-hover:opacity-100 transition-opacity">
        <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-sky-500 shadow-[0_0_5px_#0ea5e9]' : 'bg-slate-400'}`} />
        <span className="font-mono text-[8px] font-black text-slate-500 dark:text-sky-500 tracking-tighter uppercase">
          {isDark ? "Power_High" : "Eco_Mode"}
        </span>
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className="relative flex items-center justify-center p-1 bg-slate-800 dark:bg-slate-950 border-2 border-slate-900 dark:border-sky-900 transition-all active:scale-95"
        style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}
      > 
        <div className={`
          relative w-16 h-8 flex items-center px-1 transition-all duration-300
          ${isDark ? 'bg-sky-950/50' : 'bg-slate-700/50'}
        `}>
          
        
          <div className="absolute inset-x-2 h-2 bg-slate-900/50 dark:bg-sky-900/50" />
          <div className={`
            z-10 w-6 h-6 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isDark ? 'translate-x-8 bg-sky-500' : 'translate-x-0 bg-slate-200'}
            border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          `}
          style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
            <div className={`w-1 h-3 ${isDark ? 'bg-sky-900' : 'bg-slate-400'} rounded-full`} />
          </div>
          <span className={`absolute left-2 font-black text-[9px] transition-all ${!isDark ? 'text-white opacity-100' : 'text-slate-600 opacity-20'}`}>
            OFF
          </span>
          <span className={`absolute right-2 font-black text-[9px] transition-all ${isDark ? 'text-sky-400 opacity-100' : 'text-slate-600 opacity-20'}`}>
            ON
          </span>
        </div>
      </button>

      <div className="overflow-hidden h-3">
        <p className={`font-mono text-[9px] font-black uppercase tracking-[0.2em] transition-transform duration-500 ${isDark ? '-translate-y-full text-sky-400' : 'translate-y-0 text-slate-500'}`}>
          Day_Circuit<br />Night_Circuit
        </p>
      </div>
    </div>
  )
}

export default ThemeToggle
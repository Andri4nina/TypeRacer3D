import React from 'react'
import ThemeToggle from './ThemeToggle'

const Header = () => {
  return (
    <header className="relative z-10 max-w-7xl mx-auto mt-10 mb-20 px-6">
      <div className="flex items-end justify-between relative">
        <div className="relative group">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-sky-500 via-sky-500/20 to-transparent" />
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black bg-sky-500 text-slate-900 px-1.5 py-0.5 uppercase tracking-[0.2em]">
                Game_session
              </span>
            </div>
            <h1 className="font-black text-5xl md:text-7xl tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.8]">
              TYPERACER<span className="text-sky-500 font-light italic">3D</span>
            </h1>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
           {[...Array(12)].map((_, i) => (
             <div key={i} className={`h-1 w-4 ${i < 4 ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
           ))}
        </div>
        <div className="flex items-center">
          <div className="relative cursor-pointer group/btn">
            <div className="absolute inset-0 bg-slate-900 dark:bg-sky-900 translate-x-1.5 translate-y-1.5 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0 transition-transform" 
                 style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)' }} />
            
            <div className="relative p-4 bg-white dark:bg-slate-800 border border-slate-900 dark:border-sky-500 flex items-center justify-center group-hover/btn:-translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                 style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-px bg-linear-to-r from-sky-500 via-transparent to-slate-900/10 dark:to-white/10" />
        <div className="absolute -bottom-6.25 left-0 w-32 h-0.75 bg-sky-500" />
      </div>
    </header>
  )
}
export default Header
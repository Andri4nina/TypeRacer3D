import React from 'react'
import ProfilView from './ProfilView'
import CarSelectorView from './CarSelectorView'
import ColorSelectorView from './ColorSelectorView'
import ModeSelectorView from './ModeSelectorView'
import ParticleBackground from '../../../shared/components/ParticuleBackground'
import Header from '../../../shared/components/Header'

const LobbyView = () => (
  <section className="relative min-h-screen bg-slate-50 dark:bg-[#0f172a] px-4 md:px-10 pb-12 overflow-hidden transition-colors duration-500">
    {/* Background Effect */}
    <ParticleBackground />
    <Header />
    {/* Scanline Effect (Overlay subtil pour le look rétro-futuriste) */}
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-50 " />

    

    <main className="relative z-10 max-w-6xl mx-auto">
      {/* Grid Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Colonne GAUCHE (Profil & Car) - 5 colonnes sur 12 */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="relative group">
            {/* Petit badge décoratif pour chaque bloc */}
            <div className="absolute -top-3 -left-2 z-20 px-3 py-1 bg-slate-900 dark:bg-sky-600 text-white font-mono text-[8px] tracking-widest rounded-sm">
              UNIT_01
            </div>
            <ProfilView />
          </div>

          <div className="relative group">
            <div className="absolute -top-3 -left-2 z-20 px-3 py-1 bg-slate-900 dark:bg-sky-600 text-white font-mono text-[8px] tracking-widest rounded-sm">
              UNIT_02
            </div>
            <CarSelectorView />
          </div>
        </div>

        {/* Colonne DROITE (Color & Mode) - 7 colonnes sur 12 */}
        <div className="lg:col-span-7 flex flex-col gap-8 h-full">
          <div className="relative group">
            <div className="absolute -top-3 -left-2 z-20 px-3 py-1 bg-slate-900 dark:bg-sky-600 text-white font-mono text-[8px] tracking-widest rounded-sm">
              UNIT_03
            </div>
            <ColorSelectorView />
          </div>

          <div className="relative group flex-1">
            <div className="absolute -top-3 -left-2 z-20 px-3 py-1 bg-slate-900 dark:bg-sky-600 text-white font-mono text-[8px] tracking-widest rounded-sm">
              UNIT_04
            </div>
            <ModeSelectorView />
          </div>
        </div>
      </div>
    </main>

    {/* Decorative Frame Elements (Angles de l'écran) */}
    <div className="pointer-events-none fixed top-4 left-4 w-20 h-20 border-t-2 border-l-2 border-slate-200 dark:border-white/10" />
    <div className="pointer-events-none fixed bottom-4 right-4 w-20 h-20 border-b-2 border-r-2 border-slate-200 dark:border-white/10" />

  </section>
)

export default LobbyView
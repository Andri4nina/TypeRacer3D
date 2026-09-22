import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, ContactShadows, Environment } from '@react-three/drei'
import { useApp } from '../../../shared/contexts/AppContext'
import { CAR_MODELS } from '../../../boot/constants/index'
import { ProceduralCar } from '../../../shared/components/cars/CarModels'
import Icon from '../../../shared/components/Icon'

const GlbCar = ({ file, color, scale, offsetY }) => {
  const { scene } = useGLTF(file)
  const group = useRef()

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.012
  })

  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.color.set(color)
        child.material.roughness = 0.2
        child.material.metalness = 0.8
      }
    })
    return clone
  }, [scene, color])

  return <primitive object={clonedScene} scale={scale} position={[0, offsetY, 0]} ref={group} />
}

const CarPreview = ({ car, playerColor, active }) => (
  <div className="relative w-full h-40 pointer-events-none">
    {active && (
      <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(56,189,248,0.05),rgba(0,255,0,0.01),rgba(56,189,248,0.05))] bg-[length:100%_4px,4px_100%]" />
    )}

    <Canvas camera={{ position: [0, 1.5, 4], fov: 35 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={playerColor} />
      <Suspense fallback={null}>
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
          {car.file
            ? <GlbCar file={car.file} color={playerColor} scale={car.scale} offsetY={car.offsetY} />
            : <ProceduralCar color={playerColor} type={car.body} />
          }
        </Float>
        <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={10} blur={2.5} far={2} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  </div>
)

const CarSelectorView = () => {
  const { selectedCar, setSelectedCar, playerColor } = useApp()

  return (
    <div className="relative bg-slate-100 dark:bg-slate-950 border-4 border-slate-900 dark:border-sky-900 p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_#0ea5e922]">
      
      {/* HUD HEADER TACTIQUE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative">
        <div className="flex items-start gap-5">
          <div 
            className="w-2 h-14 bg-slate-900 dark:bg-sky-500 relative overflow-hidden"
            style={{ boxShadow: `0 0 20px ${playerColor}66` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-[scan_1.5s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
              VEHICLE_<span className="text-sky-500">LAB</span>
            </h2>
            <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-slate-500 dark:text-sky-500/70 uppercase tracking-[0.2em]">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               System_Ready // Authorization_Granted
            </div>
          </div>
        </div>
        
        <div className="font-mono text-[10px] bg-slate-900 text-white px-4 py-2 border-l-4 border-sky-500">
           STORAGE_UNIT: B-12
        </div>
      </header>

      {/* GRID DE SÉLECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CAR_MODELS.map((car, index) => {
          const isSelected = selectedCar === car.id
          return (
            <button
              key={car.id}
              onClick={() => setSelectedCar(car.id)}
              className={`relative flex flex-col transition-all duration-300 group
                ${isSelected ? 'translate-y-[-4px]' : 'hover:translate-y-[-2px] opacity-70 hover:opacity-100'}`}
            >
              {/* CONTAINER TYPE "CAISSE DE TRANSPORT" */}
              <div 
                className={`relative border-2 transition-all duration-300
                  ${isSelected 
                    ? 'bg-slate-200 dark:bg-slate-900 border-slate-900 dark:border-sky-500 shadow-[8px_8px_0px_0px_#0ea5e9]' 
                    : 'bg-slate-50 dark:bg-slate-800/20 border-slate-300 dark:border-slate-800'}`}
                style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)' }}
              >
                {/* Badge ID en haut à droite */}
                <div className={`absolute top-0 right-8 px-2 py-0.5 font-mono text-[9px] font-black
                  ${isSelected ? 'bg-sky-500 text-slate-900' : 'bg-slate-700 text-white'}`}>
                  UNIT_0{index + 1}
                </div>

                <CarPreview car={car} playerColor={playerColor} active={isSelected} />

                {/* PIED DE CARTE TACTIQUE */}
                <div className="p-4 bg-slate-900/5 dark:bg-black/40 border-t-2 border-slate-900/10 dark:border-sky-900/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2 text-[11px] font-black text-slate-900 dark:text-white uppercase italic tracking-widest">
                      <Icon name={car.icon} size={16} className="text-sky-500" />
                      {car.name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-sky-500">
                      {isSelected && <Icon name="check" size={11} strokeWidth={3} />}
                      {isSelected ? 'SELECTED' : 'STBY'}
                    </span>
                  </div>

                  {/* CARACTÉRISTIQUES DU CHÂSSIS */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'speed',  icon: 'gauge',     label: 'SPD' },
                      { key: 'grip',   icon: 'crosshair', label: 'GRP' },
                      { key: 'weight', icon: 'signal',    label: 'WGT' },
                    ].map(stat => (
                      <div key={stat.key} className="flex items-center gap-2">
                        <Icon name={stat.icon} size={10} className="text-slate-400 dark:text-slate-600" />
                        <span className="font-mono text-[7px] font-black text-slate-400 w-6 text-left">{stat.label}</span>
                        <div className="flex gap-[2px] h-1.5 flex-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 transition-all duration-500"
                              style={{
                                backgroundColor: i < car.rating[stat.key]
                                  ? (isSelected ? playerColor : '#64748b')
                                  : undefined,
                              }}
                            >
                              {i >= car.rating[stat.key] && (
                                <div className="h-full w-full bg-slate-300 dark:bg-slate-800" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DÉTAIL DÉCORATIF : Ligne de connexion */}
              {isSelected && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-sky-500" />
              )}
            </button>
          )
        })}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
      `}</style>
    </div>
  )
}

export default CarSelectorView
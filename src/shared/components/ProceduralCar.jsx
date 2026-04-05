import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars } from '@react-three/drei'


export const ProceduralCar = ({ color = "#ef4444" }) => {
  const group = useRef()
  


  // Matériaux prédéfinis
  const carbonMaterial = <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
  const tireMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
  const rimMaterial = <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
  const bodyMaterial = <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} envMapIntensity={1} />

  return (
    <group ref={group} rotation={[0, -Math.PI / 2, 0]} >
      {/* --- CHÂSSIS CENTRAL --- */}
      {/* Nez de la voiture (fuselé) */}
      <mesh position={[0.7, 0.15, 0]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[1.2, 0.12, 0.35]} />
        {bodyMaterial}
      </mesh>
      
      {/* Cockpit / Corps principal */}
      <mesh position={[-0.1, 0.22, 0]}>
        <boxGeometry args={[0.8, 0.28, 0.55]} />
        {bodyMaterial}
      </mesh>

      {/* Appui-tête / Prise d'air supérieure */}
      <mesh position={[-0.3, 0.42, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        {tireMaterial}
      </mesh>

      {/* Pontons latéraux (Aérodynamisme) */}
      {[1, -1].map((side) => (
        <group key={`side-${side}`} position={[-0.1, 0.15, 0.35 * side]}>
          <mesh rotation={[0, side * 0.1, 0]}>
            <boxGeometry args={[0.7, 0.2, 0.25]} />
            {bodyMaterial}
          </mesh>
          {/* Entrée d'air noire */}
          <mesh position={[0.36, 0, 0]}>
            <boxGeometry args={[0.02, 0.15, 0.2]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
      ))}

      {/* --- AILERONS --- */}
      {/* Aileron Avant complexe */}
      <group position={[1.2, 0.08, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.03, 1.1]} />
          {carbonMaterial}
        </mesh>
        {[0.45, -0.45].map((z, i) => (
          <mesh key={i} position={[0, 0.05, z]}>
            <boxGeometry args={[0.18, 0.1, 0.02]} />
            {carbonMaterial}
          </mesh>
        ))}
      </group>

      {/* Aileron Arrière imposant */}
      <group position={[-1.1, 0.35, 0]}>
        {/* Supports */}
        {[0.15, -0.15].map((z, i) => (
          <mesh key={i} position={[0, -0.1, z]}>
            <boxGeometry args={[0.05, 0.3, 0.02]} />
            {carbonMaterial}
          </mesh>
        ))}
        {/* Lame principale */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.25, 0.04, 1.0]} />
          {carbonMaterial}
        </mesh>
        {/* Plaques latérales */}
        {[0.5, -0.5].map((z, i) => (
          <mesh key={i} position={[0, 0.05, z]}>
            <boxGeometry args={[0.35, 0.25, 0.03]} />
            {carbonMaterial}
          </mesh>
        ))}
      </group>

      {/* --- ROUES & SUSPENSIONS --- */}
      {[
        { pos: [0.8, 0.1, 0.55], type: 'front' },
        { pos: [0.8, 0.1, -0.55], type: 'front' },
        { pos: [-0.8, 0.15, 0.6], type: 'back' },
        { pos: [-0.8, 0.15, -0.6], type: 'back' },
      ].map((wheel, i) => {
        const isBack = wheel.type === 'back';
        const radius = isBack ? 0.24 : 0.2;
        const width = isBack ? 0.35 : 0.28;
        
        return (
          <group key={i} position={wheel.pos}>
            {/* Bras de suspension */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.2 * (wheel.pos[0] > 0 ? 1 : -1), 0, -0.2 * (wheel.pos[2] > 0 ? 1 : -1)]}>
              <cylinderGeometry args={[0.015, 0.015, 0.4]} />
              {carbonMaterial}
            </mesh>

            {/* Pneu */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[radius, radius, width, 32]} />
              {tireMaterial}
            </mesh>
            
            {/* Jante */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[radius * 0.6, radius * 0.6, width + 0.02, 16]} />
              {rimMaterial}
            </mesh>

            {/* Détail écrou central (émissif) */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, (width / 2 + 0.02) * (wheel.pos[2] > 0 ? 1 : -1)]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </mesh>
          </group>
        );
      })}

      {/* --- DÉTAILS FINAUX --- */}
      {/* Feu de pluie arrière */}
      <mesh position={[-1.25, 0.15, 0]}>
        <boxGeometry args={[0.05, 0.08, 0.08]} />
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={5} />
      </mesh>
    </group>
  )
}

export default function App() {
  return (
    <div className="w-full h-screen bg-slate-950">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={40} />
        
        {/* Éclairage Studio */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#3b82f6" />
        
       
          <ProceduralCar color="#ef4444" />
    

        {/* Environnement & Sol */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />
        
        <ContactShadows 
          position={[0, -0.1, 0]} 
          opacity={0.6} 
          scale={10} 
          blur={2.5} 
          far={0.8} 
        />

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          autoRotate={false}
        />
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-8 left-8 text-white pointer-events-none">
        <h1 className="text-4xl font-black tracking-tighter italic">NEO-FORMULA</h1>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Procedural 3D Prototype</p>
      </div>
    </div>
  )
}
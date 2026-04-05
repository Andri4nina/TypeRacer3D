import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

const GlbCarMesh = ({ file, color, scale, offsetY }) => {
  const { scene } = useGLTF(file)
  const cloned = useMemo(() => {
    const s = scene.clone(true)
    s.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.color.set(color)
      }
    })
    return s
  }, [scene, color])

  return <primitive object={cloned} scale={scale} position={[0, offsetY, 0]} />
}

export default GlbCarMesh

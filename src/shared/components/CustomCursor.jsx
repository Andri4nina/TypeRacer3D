import React, { useEffect, useState, useRef } from 'react'

const CustomCursor = ({ 
  color = "#0ea5e9"
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  
  const dotOutline = useRef(null)

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })

      if (dotOutline.current) {
        dotOutline.current.animate({
          left: `${e.clientX}px`,
          top: `${e.clientY}px`
        }, { duration: 150, fill: "forwards", easing: "ease-out" })
      }

      const target = e.target
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' || 
        ['BUTTON', 'A', 'INPUT'].includes(target.tagName)
      )
    }

    const onMouseDown = () => setIsMouseDown(true)
    const onMouseUp = () => setIsMouseDown(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <>
      {/* 1. LE POINT CENTRAL (Core) */}
      <div 
        className="fixed top-0 left-0 pointer-events-none z-100 transition-transform duration-75"
        style={{
          width: `4px`,
          height: `4px`,
          backgroundColor: isPointer ? '#10b981' : color, // Vert si target
          transform: `translate3d(${position.x - 2}px, ${position.y - 2}px, 0) scale(${isMouseDown ? 2 : 1})`,
          boxShadow: `0 0 10px ${isPointer ? '#10b981' : color}`,
        }}
      />

      {/* 2. LE RÉTICULE EXTÉRIEUR (Mechanical Frame) */}
      <div 
        ref={dotOutline}
        className="fixed top-0 left-0 pointer-events-none z-99 flex items-center justify-center transition-all duration-200"
        style={{
          width: `${isPointer ? 45 : 30}px`,
          height: `${isPointer ? 45 : 30}px`,
          transform: `translate3d(-50%, -50%, 0) rotate(${isPointer ? 90 : 0}deg)`,
        }}
      >
        {/* Les 4 coins du viseur */}
        <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${isPointer ? 'border-emerald-500' : 'border-sky-500'}`} />
        <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${isPointer ? 'border-emerald-500' : 'border-sky-500'}`} />
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${isPointer ? 'border-emerald-500' : 'border-sky-500'}`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${isPointer ? 'border-emerald-500' : 'border-sky-500'}`} />

        {/* Lignes de scan optionnelles quand on survole un bouton */}
        {isPointer && (
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
        )}
      </div>

      {/* 3. L'INDICATEUR DE CLIC (Shockwave) */}
      {isMouseDown && (
        <div 
          className="fixed pointer-events-none z-98 border border-white/50 animate-[ping_0.4s_ease-out_infinite]"
          style={{
            left: position.x,
            top: position.y,
            width: '60px',
            height: '60px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '2px', 
          }}
        />
      )}
    </>
  )
}

export default CustomCursor
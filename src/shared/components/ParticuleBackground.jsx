import React, { useEffect, useRef } from 'react';

const ParticuleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const isDark = document.documentElement.classList.contains('dark');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

  
    const gridSpacing = 60;
    let offset = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const color = isDark ? '14, 165, 233' : '100, 116, 139';
      ctx.lineWidth = 1;


      for (let y = 0; y < canvas.height; y += gridSpacing) {
        const opacity = (y / canvas.height) * 0.2; 
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y + (offset % gridSpacing));
        ctx.lineTo(canvas.width, y + (offset % gridSpacing));
        ctx.stroke();
      }

     
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        const opacity = 0.05; // Très léger sur les verticales
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

 
      for (let i = 0; i < 20; i++) {
         const px = (Math.sin(i + offset * 0.01) * canvas.width / 2) + canvas.width / 2;
         const py = (Math.cos(i * 0.5 + offset * 0.02) * canvas.height / 2) + canvas.height / 2;
         
         ctx.fillStyle = `rgba(${color}, 0.3)`;
         ctx.fillRect(px, py, 3, 3);
         
         // Petit halo autour du bit
         ctx.shadowBlur = 10;
         ctx.shadowColor = `rgb(${color})`;
         ctx.fillRect(px, py, 1, 1);
         ctx.shadowBlur = 0;
      }

      offset += 0.5;
      animationFrameId = requestAnimationFrame(drawGrid);
    };

    window.addEventListener('resize', resize);
    resize();
    drawGrid();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0  z-10 pointer-events-none bg-slate-50 dark:bg-[#020617] transition-colors duration-500"
    />
  );
};

export default ParticuleBackground;
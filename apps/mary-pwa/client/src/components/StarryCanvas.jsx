import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function StarryCanvas() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isStarry = theme === 'starry-night';
    const starCount = isStarry ? 95 : 45;

    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    }));

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Cor das partículas sutilmente adaptada ao tema
      const starColor = isStarry
        ? '56, 189, 248' // Ciano/Azul Cinnamoroll
        : theme === 'neon-rose'
        ? '255, 42, 133' // Rosa Néon
        : theme === 'cyber-goth'
        ? '192, 132, 252' // Lilás Kuromi
        : '244, 63, 94'; // Dark Romantic

      for (const s of stars) {
        s.alpha += s.speed * s.direction;
        if (s.alpha >= 0.85) {
          s.alpha = 0.85;
          s.direction = -1;
        } else if (s.alpha <= 0.15) {
          s.alpha = 0.15;
          s.direction = 1;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${s.alpha})`;
        ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = `rgba(${starColor}, 0.8)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: theme === 'starry-night' ? 0.85 : 0.45 }}
    />
  );
}

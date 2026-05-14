import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: ${props => props.theme.canvasBg};
`;

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: null, y: null };
    let gridLines = [];
    let mouseTrail = [];

    // 设置画布尺寸
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 鼠标事件
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseTrail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (mouseTrail.length > 20) mouseTrail.shift();
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    // 初始化网格线
    const initGrid = () => {
      gridLines = [];
      const spacing = 80;
      for (let x = 0; x < canvas.width; x += spacing) {
        gridLines.push({ x, type: 'vertical', offset: Math.random() * Math.PI * 2 });
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        gridLines.push({ y, type: 'horizontal', offset: Math.random() * Math.PI * 2 });
      }
    };
    initGrid();

    // 粒子类
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
        this.hue = Math.random() > 0.5 ? 230 : 270;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.life = 1;
        this.decay = Math.random() * 0.002 + 0.001;
      }

      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.5 + 0.5;

        // 鼠标吸引
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            this.x += dx * 0.02;
            this.y += dy * 0.02;
          }
        }

        // 边界重置
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw(time) {
        const currentOpacity = this.opacity * (0.5 + this.pulse * 0.5);
        const size = this.size * (0.8 + this.pulse * 0.4);

        // 发光效果
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 3);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 60%, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 核心点
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${currentOpacity + 0.3})`;
        ctx.fill();
      }
    }

    // 初始化粒子
    const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 绘制网格
    const drawGrid = (time) => {
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.03)';
      ctx.lineWidth = 1;

      gridLines.forEach(line => {
        const pulse = Math.sin(time * 0.001 + line.offset) * 0.5 + 0.5;
        ctx.globalAlpha = 0.02 + pulse * 0.02;

        if (line.type === 'vertical') {
          ctx.beginPath();
          ctx.moveTo(line.x, 0);
          ctx.lineTo(line.x, canvas.height);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, line.y);
          ctx.lineTo(canvas.width, line.y);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };

    // 绘制鼠标轨迹
    const drawMouseTrail = () => {
      mouseTrail.forEach((point, index) => {
        point.life -= 0.05;
        if (point.life > 0) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.life * 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(118, 75, 162, ${point.life * 0.3})`;
          ctx.fill();
        }
      });
      mouseTrail = mouseTrail.filter(p => p.life > 0);
    };

    // 绘制粒子连线
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // 鼠标连线
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(118, 75, 162, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    // 动画循环
    const animate = (time) => {
      const fadeColor = theme === 'dark' ? 'rgba(10, 10, 10, 0.1)' : 'rgba(248, 250, 252, 0.1)';
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid(time);
      drawMouseTrail();

      particles.forEach(p => {
        p.update(time);
        p.draw(time);
      });

      drawConnections();

      animationId = requestAnimationFrame(animate);
    };

    // 初始填充
    const bgColor = theme === 'dark' ? '#0a0a0a' : '#f8fafc';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animate(0);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [theme]);

  return <Canvas ref={canvasRef} />;
};

export default ParticleBackground;

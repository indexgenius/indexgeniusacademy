import React, { useEffect, useRef } from 'react';

const TacticalEvolution = ({ stage = 0 }) => {
    const canvasRef = useRef(null);
    const isInView = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;
        let particles = [];
        let fallingSquares = [];

        // Stage-based configuration
        const config = {
            0: { // Quienes Somos (Neural Network Only)
                particleCount: 20,
                squareCount: 0,
                gridOpacity: 0,
                connectionOpacity: 0.2,
                particleOpacity: 0.3,
                showSquares: false
            },
            1: { // Nuestra Mision (Transition)
                particleCount: 50,
                squareCount: 0,
                gridOpacity: 0,
                connectionOpacity: 0.35,
                particleOpacity: 0.5,
                showSquares: false
            },
            2: { // Nuestros Servicios (Network Only)
                particleCount: 80,
                squareCount: 0,
                gridOpacity: 0,
                connectionOpacity: 0.45,
                particleOpacity: 0.7,
                showSquares: false
            }
        }[stage] || config[0];

        const connectionDistance = 150;
        const mouse = { x: null, y: null, radius: 200 };

        const observer = new IntersectionObserver(
            ([entry]) => {
                isInView.current = entry.isIntersecting;
                if (isInView.current) animate();
            },
            { threshold: 0.01 }
        );
        observer.observe(canvas);

        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        class Particle {
            constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 3 + 2;
                this.alpha = 0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                if (this.alpha < config.particleOpacity) this.alpha += 0.01;

                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < mouse.radius * mouse.radius) {
                        const dist = Math.sqrt(d2);
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x -= Math.cos(angle) * force * 5;
                        this.y -= Math.sin(angle) * force * 5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 6.28);
                ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
                ctx.fill();
            }
        }

        class FallingSquare {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.size = Math.random() * 30 + 15;
                this.x = Math.random() * canvas.width;
                this.y = -50;
                this.speed = Math.random() * 1.5 + 0.8;
                this.rotation = Math.random() * 6.28;
                this.rotSpeed = (Math.random() - 0.5) * 0.02;
                this.alpha = 0;
                this.fused = false;
            }

            update() {
                this.y += this.speed;
                this.rotation += this.rotSpeed;
                if (this.alpha < 0.2) this.alpha += 0.005;

                // Fusion logic: squares are more likely to fuse in stage 1
                const fusionChance = stage === 0 ? 0.002 : 0.01;
                if (!this.fused && this.y > canvas.height * 0.4 && Math.random() < fusionChance) {
                    this.fused = true;
                    if (particles.length < config.particleCount + 30) {
                        particles.push(new Particle(this.x, this.y));
                    }
                }

                if (this.y > canvas.height + 50) this.reset();
            }

            draw() {
                if (!config.showSquares) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.strokeStyle = `rgba(0, 0, 0, ${this.alpha})`;
                ctx.lineWidth = 1.2;
                ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

                ctx.beginPath();
                ctx.moveTo(-5, 0); ctx.lineTo(5, 0);
                ctx.moveTo(0, -5); ctx.lineTo(0, 5);
                ctx.stroke();
                ctx.restore();

                // Connect squares to particles
                for (let p of particles) {
                    const dx = this.x - p.x;
                    const dy = this.y - p.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < (connectionDistance * 1.2) * (connectionDistance * 1.2)) {
                        const dist = Math.sqrt(d2);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - dist / (connectionDistance * 1.2)) * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(p.x, p.y);
                        ctx.stroke();
                    }
                }
            }
        }

        const drawGrid = () => {
            if (config.gridOpacity <= 0) return;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${config.gridOpacity})`;
            ctx.lineWidth = 1;
            const step = 60;
            for (let x = 0; x <= canvas.width; x += step) {
                ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
            }
            for (let y = 0; y <= canvas.height; y += step) {
                ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();
        };

        const init = () => {
            particles = [];
            fallingSquares = [];
            for (let i = 0; i < config.particleCount; i++) particles.push(new Particle());
            for (let i = 0; i < config.squareCount; i++) fallingSquares.push(new FallingSquare());
        };

        const animate = () => {
            if (!isInView.current) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawGrid();

            fallingSquares.forEach(s => {
                s.update();
                s.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.update();
                p1.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const d2 = dx * dx + dy * dy;

                    if (d2 < connectionDistance * connectionDistance) {
                        const dist = Math.sqrt(d2);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - dist / connectionDistance) * config.connectionOpacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const resize = () => {
            if (!canvas) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init();
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [stage]);

    return (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default TacticalEvolution;

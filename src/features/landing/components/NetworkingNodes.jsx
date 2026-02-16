import React, { useEffect, useRef } from 'react';

const NetworkingNodes = () => {
    const canvasRef = useRef(null);
    const isInView = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;
        let particles = [];
        const mouse = { x: null, y: null, radius: 150 };
        const connectionDistance = 120;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isInView.current = entry.isIntersecting;
                if (isInView.current) animate();
            },
            { threshold: 0.01 }
        );
        observer.observe(canvas);

        const handleMouseMove = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 3 + 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

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
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const count = Math.min((canvas.width * canvas.height) / 20000, 80);
            for (let i = 0; i < count; i++) particles.push(new Particle());
        };

        const animate = () => {
            if (!isInView.current) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

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
                        ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - dist / connectionDistance) * 0.3})`;
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
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default NetworkingNodes;

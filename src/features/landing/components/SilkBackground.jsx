import React from 'react';
import { motion } from 'framer-motion';
import NetworkingNodes from './NetworkingNodes';

const SilkBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-white">
            {/* Silk Waves SVG */}
            <svg
                viewBox="0 0 1440 800"
                className="absolute inset-0 w-full h-full opacity-40"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="silk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#f8f8f8', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f2f2f2', stopOpacity: 1 }} />
                    </linearGradient>

                    <filter id="blur-silk">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                    </filter>

                    <radialGradient id="red-glow">
                        <stop offset="0%" stopColor="#ff0000" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                    </radialGradient>
                </defs>

                <rect width="100%" height="100%" fill="#fcfcfc" />

                {/* Optimized Static Paths with CSS float animation */}
                <path
                    d="M-200,300 Q400,100 800,300 T1800,300 L1800,1000 L-200,1000 Z"
                    fill="url(#silk-grad)"
                    filter="url(#blur-silk)"
                    className="opacity-70 animate-pulse"
                    style={{ animationDuration: '8s' }}
                />

                <path
                    d="M-100,500 Q500,200 1100,500 T2100,500 L2100,1000 L-100,1000 Z"
                    fill="#ffffff"
                    filter="url(#blur-silk)"
                    className="opacity-80 animate-pulse"
                    style={{ animationDuration: '10s', animationDelay: '1s' }}
                />

                <circle cx="0" cy="0" r="500" fill="url(#red-glow)" className="opacity-10" />
            </svg>

            {/* Tactical Strips (SVG Based) */}
            <svg
                viewBox="0 0 1440 800"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Red Strip */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.05 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    d="M-200,600 L1600,200 L1600,350 L-200,750 Z"
                    fill="red"
                />

                {/* Black Strip */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.03 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    d="M-200,100 L1600,500 L1600,650 L-200,250 Z"
                    fill="black"
                />

                {/* Tactical Reticle (Crosshair) Background */}
                <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="origin-center"
                >
                    <circle cx="720" cy="400" r="150" fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="10 5" />
                    <circle cx="720" cy="400" r="2" fill="red" />
                    <line x1="720" y1="200" x2="720" y2="350" stroke="red" strokeWidth="0.5" />
                    <line x1="720" y1="450" x2="720" y2="600" stroke="red" strokeWidth="0.5" />
                    <line x1="520" y1="400" x2="670" y2="400" stroke="red" strokeWidth="0.5" />
                    <line x1="770" y1="400" x2="920" y2="400" stroke="red" strokeWidth="0.5" />

                    {/* Pulsing Glow on Crosshair */}
                    <motion.circle
                        cx="720"
                        cy="400"
                        r="150"
                        fill="none"
                        stroke="red"
                        strokeWidth="2"
                        animate={{ opacity: [0, 0.5, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.g>
            </svg>
        </div>
    );
};

export default SilkBackground;

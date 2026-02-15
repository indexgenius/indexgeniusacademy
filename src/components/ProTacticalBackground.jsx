import React from 'react';
import { motion } from 'framer-motion';

const ProTacticalBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black h-full w-full select-none">
            {/* Base Ambient Red Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-red-600/[0.02] blur-[150px] pointer-events-none" />

            {/* Dynamic Moving Grid */}
            <div className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #ff0000 1px, transparent 1px),
                        linear-gradient(to bottom, #ff0000 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                }}
            />

            {/* Moving Technical Data Streams */}
            <div className="absolute inset-0 overflow-hidden opacity-[0.03] flex justify-around">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: "-100%" }}
                        animate={{ y: "100%" }}
                        transition={{
                            duration: 15 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        }}
                        className="text-[10px] font-mono text-red-500 whitespace-nowrap writing-vertical-lr select-none"
                    >
                        {Array(50).fill(0).map(() => Math.random().toString(16).substring(2, 8).toUpperCase()).join(' ')}
                    </motion.div>
                ))}
            </div>

            {/* Glowing HUD Corners */}
            <div className="absolute inset-10 border border-red-600/10 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600/40" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/40" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/40" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600/40" />
            </div>

            {/* Central Pulse (Behind Content) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/[0.03] blur-[120px] rounded-full animate-pulse" />

            {/* Scanning Line */}
            <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent z-10 opacity-30"
            />

            {/* Overlays */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]" />
            <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.9)]" />
        </div>
    );
};

export default ProTacticalBackground;

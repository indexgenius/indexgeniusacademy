import React from 'react';
import { motion } from 'framer-motion';

const TacticalBullBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black h-full w-full select-none">
            {/* Ambient Red Glows */}
            <div className="absolute top-0 left-0 w-full h-full bg-red-600/[0.03] blur-[150px] pointer-events-none" />

            {/* Animated Grid/Particles Background */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ff0000 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Central Bull Image Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -15, 0],
                        rotateY: [-5, 5, -5]
                    }}
                    transition={{
                        opacity: { duration: 1.5 },
                        scale: { duration: 1 },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative w-full max-w-5xl flex items-center justify-center -mt-20 lg:-mt-32"
                >
                    {/* Pulsing Light behind image - intensified */}
                    <div className="absolute w-[90%] h-[90%] bg-red-600/20 blur-[120px] rounded-full animate-pulse" />

                    <img
                        src="/img/toro3d/ChatGPT%20Image%2015%20feb%202026%2C%2011_21_36%20a.m..png"
                        alt="Tactical Bull"
                        className="w-auto h-auto max-w-[90%] max-h-[75vh] object-contain relative z-10 drop-shadow-[0_0_60px_rgba(220,38,38,0.5)] contrast-[1.25]"
                        style={{ mixBlendMode: 'screen' }}
                    />
                </motion.div>
            </div>

            {/* Tactical Overlays */}
            {/* Scanlines - Intensified */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]" />

            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,1)]" />

            {/* Terminal Grid (Subtle) */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ff0000 1px, transparent 1px), linear-gradient(to bottom, #ff0000 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }}
            />
        </div>
    );
};

export default TacticalBullBackground;

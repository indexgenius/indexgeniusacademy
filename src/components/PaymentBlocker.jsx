import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';

const PaymentBlocker = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(
        localStorage.getItem('app_payment_unlocked') === 'true'
    );
    const [buffer, setBuffer] = useState('');
    const secretCommand = '123457890987654321234123982341212391248912472934120371902412483487298471381293012093pagamerapido qwelt723091732014';

    useEffect(() => {
        if (isUnlocked) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

            if (e.key === 'Backspace') {
                setBuffer(prev => prev.slice(0, -1));
                return;
            }

            if (e.key.length === 1) {
                setBuffer(prev => {
                    const newBuffer = prev + e.key;
                    if (newBuffer.endsWith(secretCommand)) {
                        setIsUnlocked(true);
                        localStorage.setItem('app_payment_unlocked', 'true');
                        return '';
                    }
                    // Keep buffer manageable for display, but long enough for the command
                    return newBuffer.slice(-secretCommand.length);
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isUnlocked, secretCommand]);

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#0a0000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            overflow: 'hidden',
            cursor: 'default'
        }}>
            {/* Animated Mesh Background */}
            <motion.div
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 20%, rgba(255, 0, 50, 0.08) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 80%, rgba(150, 0, 0, 0.08) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 80%, rgba(255, 0, 50, 0.08) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 20%, rgba(255, 0, 50, 0.08) 0%, transparent 50%)',
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />

            {/* Scanlines Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 1px, transparent 1px, transparent 2px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
            >
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ marginBottom: '2rem' }}
                >
                    <ShieldAlert size={80} style={{ filter: 'drop-shadow(0 0 15px rgba(255,0,51,0.6))', color: '#ff0033' }} />
                </motion.div>

                <h1 style={{
                    fontSize: '8.5rem',
                    margin: 0,
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                    color: '#fff',
                    textShadow: '0 0 20px rgba(255,0,51,0.4), 0 0 40px rgba(255,0,51,0.2)',
                    position: 'relative'
                }}>
                    404
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        color: '#440000',
                        zIndex: -1,
                        opacity: 0.8,
                        transform: 'translate(6px, 6px)'
                    }}>404</span>
                </h1>

                <motion.p
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 }}
                    style={{
                        fontSize: '1.3rem',
                        marginTop: '1rem',
                        color: '#ff0033',
                        textTransform: 'uppercase',
                        letterSpacing: '0.45em',
                        fontWeight: 300,
                        textShadow: '0 0 15px rgba(255,0,51,0.6)'
                    }}
                >
                    N.P.M // ACCESS_TERMINATED
                </motion.p>

                <div style={{
                    marginTop: '3.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                    padding: '2rem',
                    border: '1px solid rgba(255,0,51,0.15)',
                    background: 'rgba(255,0,51,0.03)',
                    borderRadius: '4px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'inset 0 0 20px rgba(255,0,51,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', opacity: 0.9 }}>
                        <Terminal size={18} color="#ff0033" />
                        <span style={{ fontSize: '0.85rem', color: '#ff0033', letterSpacing: '0.1em' }}>CRITICAL_ERROR: PAYMENT_REQUIRED</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', opacity: 0.9 }}>
                        <Lock size={18} color="#ff0033" />
                        <span style={{ fontSize: '0.85rem', color: '#ff0033', letterSpacing: '0.1em' }}>ENCRYPTION_LAYER: OVERRIDE_BLOCK</span>
                    </div>
                </div>
            </motion.div>

            {/* Secret Console UI */}
            <AnimatePresence>
                {buffer.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(15, 0, 0, 0.95)',
                            padding: '15px 25px',
                            borderRadius: '2px',
                            border: '1px solid #ff0033',
                            boxShadow: '0 0 20px rgba(255, 0, 51, 0.3)',
                            zIndex: 20,
                            minWidth: '350px',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#ff0033', fontWeight: 'bold' }}>ROOT@DEBT_SERVER:~$</span>
                            <span style={{ color: '#fff', fontSize: '1rem', letterSpacing: '2px' }}>
                                {buffer.slice(-25).split('').map((char, i) => (
                                    <span key={i} style={{ color: i > buffer.slice(-25).length - 2 ? '#ff0033' : '#fff' }}>*</span>
                                ))}
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.6 }}
                                    style={{ borderLeft: '10px solid #ff0033', marginLeft: '5px' }}
                                />
                            </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255, 0, 51, 0.6)', marginTop: '8px', borderTop: '1px solid rgba(255,0,51,0.1)', paddingTop: '5px' }}>
                            SECURE_BUFFER_FEEDBACK: {buffer.length} BITS CAPTURED
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animated Decoration */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    width: '800px',
                    height: '800px',
                    border: '1px dashed rgba(255,0,51,0.08)',
                    borderRadius: '50%',
                    zIndex: 0
                }}
            />


            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
            `}} />
        </div>
    );
};

export default PaymentBlocker;


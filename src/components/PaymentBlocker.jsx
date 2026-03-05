import React, { useState, useEffect } from 'react';

const PaymentBlocker = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(
        localStorage.getItem('app_payment_unlocked') === 'true'
    );

    useEffect(() => {
        if (isUnlocked) return;

        const secretCommand = '123457890987654321234123982341212391248912472934120371902412483487298471381293012093pagamerapido qwelt723091732014';
        let inputBuffer = '';

        const handleKeyDown = (e) => {
            // Ignore modifier keys alone
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
                return;
            }

            if (e.key.length === 1) { // Only process single character keys
                inputBuffer += e.key;

                // Keep buffer size limited to secret command length
                if (inputBuffer.length > secretCommand.length) {
                    inputBuffer = inputBuffer.slice(-secretCommand.length);
                }

                if (inputBuffer === secretCommand) {
                    setIsUnlocked(true);
                    localStorage.setItem('app_payment_unlocked', 'true');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isUnlocked]);

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f8f9fa',
            color: '#212529',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            textAlign: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 999999
        }}>
            <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 300 }}>404</h1>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#6c757d' }}>
                N.P.M
            </p>
        </div>
    );
};

export default PaymentBlocker;

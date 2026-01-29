import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export const CountUp = ({ end, duration = 2, suffix = "", prefix = "", decimals = 0, enableKFormat = false }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false });

    useEffect(() => {
        if (!isInView) {
            setCount(0);
            return;
        }

        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000);

            if (progress < 1) {
                const currentCount = end * progress;
                setCount(currentCount);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);

    let displayValue;
    if (enableKFormat) {
        if (count >= 1000) {
            displayValue = (count / 1000).toFixed(1) + 'k';
        } else {
            displayValue = Math.floor(count);
        }
    } else {
        displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count);
    }

    return <span ref={ref}>{prefix}{displayValue}{!enableKFormat && suffix}</span>;
};

export const TypewriterText = ({ text, delay = 50 }) => {
    const [displayText, setDisplayText] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false });

    useEffect(() => {
        if (!isInView) {
            setDisplayText('');
            return;
        }

        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, delay);

        return () => clearInterval(timer);
    }, [text, delay, isInView]);

    return <span ref={ref}>{displayText}</span>;
};

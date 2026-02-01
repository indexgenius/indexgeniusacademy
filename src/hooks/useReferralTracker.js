import { useEffect } from 'react';

export const useReferralTracker = () => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');

        // Validation: Must exist, not be just '/', and have a reasonable length (Firebase UIDs are ~28 chars)
        if (ref && ref.trim() !== "" && ref !== "/" && ref.length > 5) {
            console.log('🎯 Valid Referral detected:', ref);
            localStorage.setItem('referralCode', ref);

            // Clean up URL after capturing
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
        } else if (ref === "/" || (ref && ref.length <= 5)) {
            // Clear junk codes
            localStorage.removeItem('referralCode');
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);
};

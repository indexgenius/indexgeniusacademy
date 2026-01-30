import { auth } from '../firebase';

const VERCEL_API_URL = import.meta.env.VITE_API_URL || 'https://ingenus-fx.vercel.app/api';

/**
 * Generic fetch wrapper for our backend API
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${VERCEL_API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const text = await response.text();
        let errorData = { error: 'Unknown API error' };
        try {
            errorData = JSON.parse(text);
        } catch (e) {
            console.error("Non-JSON error response:", text);
        }
        throw new Error(errorData.details || errorData.error || `Error ${response.status}`);
    }

    return response.json();
};

export const broadcast = (payload) => apiFetch('/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
});

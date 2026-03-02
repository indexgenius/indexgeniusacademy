import { useState, useEffect } from 'react';

// Fallback list in case API fails
const FALLBACK_COUNTRIES = [
    { name: 'United States', code: '+1', flag: '🇺🇸', iso: 'US' },
    { name: 'México', code: '+52', flag: '🇲🇽', iso: 'MX' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴', iso: 'CO' },
    { name: 'República Dominicana', code: '+1', flag: '🇩🇴', iso: 'DO' },
    { name: 'Chile', code: '+56', flag: '🇨🇱', iso: 'CL' },
    { name: 'Perú', code: '+51', flag: '🇵🇪', iso: 'PE' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷', iso: 'AR' },
    { name: 'Venezuela', code: '+58', flag: '🇻🇪', iso: 'VE' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨', iso: 'EC' },
    { name: 'Panamá', code: '+507', flag: '🇵🇦', iso: 'PA' },
    { name: 'Costa Rica', code: '+506', flag: '🇨🇷', iso: 'CR' },
    { name: 'Guatemala', code: '+502', flag: '🇬🇹', iso: 'GT' },
    { name: 'El Salvador', code: '+503', flag: '🇸🇻', iso: 'SV' },
    { name: 'Honduras', code: '+504', flag: '🇭🇳', iso: 'HN' },
    { name: 'España', code: '+34', flag: '🇪🇸', iso: 'ES' },
    { name: 'Brasil', code: '+55', flag: '🇧🇷', iso: 'BR' },
    { name: 'Bolivia', code: '+591', flag: '🇧🇴', iso: 'BO' },
    { name: 'Paraguay', code: '+595', flag: '🇵🇾', iso: 'PY' },
    { name: 'Uruguay', code: '+598', flag: '🇺🇾', iso: 'UY' },
    { name: 'Nicaragua', code: '+505', flag: '🇳🇮', iso: 'NI' },
    { name: 'Cuba', code: '+53', flag: '🇨🇺', iso: 'CU' },
    { name: 'Puerto Rico', code: '+1', flag: '🇵🇷', iso: 'PR' },
];

// Priority countries that should appear first (LATAM focus)
const PRIORITY_ISOS = ['US', 'MX', 'CO', 'DO', 'CL', 'PE', 'AR', 'VE', 'EC', 'PA', 'CR', 'GT', 'SV', 'HN', 'ES', 'BR'];

// Convert ISO country code to flag emoji
const isoToFlag = (iso) => {
    if (!iso || iso.length !== 2) return '🏳️';
    return String.fromCodePoint(...[...iso.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
};

// Cache key for localStorage
const CACHE_KEY = 'country_codes_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const useCountryCodes = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCountries = async () => {
            // Check cache first
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setCountries(data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) { /* cache read failed, continue */ }

            try {
                const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
                if (!res.ok) throw new Error('API failed');

                const data = await res.json();

                const parsed = data
                    .filter(c => c.idd?.root) // Must have calling code
                    .map(c => {
                        const suffixes = c.idd.suffixes || [''];
                        // For countries with single suffix, combine root+suffix
                        // For countries with many suffixes (like US territories), just use root
                        const code = suffixes.length === 1
                            ? `${c.idd.root}${suffixes[0]}`
                            : c.idd.root;

                        return {
                            name: c.name.common,
                            code: code,
                            flag: isoToFlag(c.cca2),
                            iso: c.cca2
                        };
                    })
                    .filter(c => c.code && c.code.length >= 2); // Valid codes only

                // Sort: priority countries first, then alphabetically
                parsed.sort((a, b) => {
                    const aPriority = PRIORITY_ISOS.indexOf(a.iso);
                    const bPriority = PRIORITY_ISOS.indexOf(b.iso);

                    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
                    if (aPriority !== -1) return -1;
                    if (bPriority !== -1) return 1;
                    return a.name.localeCompare(b.name);
                });

                setCountries(parsed);

                // Cache the result
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: parsed, timestamp: Date.now() }));
                } catch (e) { /* storage full, ignore */ }

            } catch (err) {
                console.warn('Country API failed, using fallback:', err);
                setCountries(FALLBACK_COUNTRIES);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    return { countries, loading };
};

export default useCountryCodes;

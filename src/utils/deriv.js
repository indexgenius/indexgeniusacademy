const DERIV_APP_ID = 1089;
let sharedWs = null;
const pendingRequests = new Map(); // reqId -> {resolve, reject, timeout, symbol}
const activeSubscriptions = new Map(); // symbol -> lastQuote
const inFlightRequests = new Map(); // symbol -> Promise

const getSocket = () => {
    if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) {
        return sharedWs;
    }

    sharedWs = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

    // Heartbeat to prevent disconnection
    let pingInterval;

    sharedWs.onopen = () => {
        pingInterval = setInterval(() => {
            if (sharedWs && sharedWs.readyState === WebSocket.OPEN) {
                sharedWs.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000);
    };

    sharedWs.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.msg_type === 'ping') return;
        const reqId = data.echo_req?.req_id;

        // Handle Ticks (Continuous Feed)
        if (data.tick) {
            const sym = data.tick.symbol;
            activeSubscriptions.set(sym, data.tick.quote);

            // Resolve any ONE-TIME requests waiting for this symbol
            pendingRequests.forEach((req, id) => {
                if (req.symbol === sym) {
                    clearTimeout(req.timeout);
                    req.resolve(data.tick.quote);
                    pendingRequests.delete(id);
                }
            });
        }

        // Handle specific numbered responses
        if (reqId && pendingRequests.has(reqId)) {
            const { resolve, reject, timeout, symbol } = pendingRequests.get(reqId);

            if (data.error) {
                if (data.error.code === 'AlreadySubscribed') {
                    // This is fine, we just wait for the next tick
                    return;
                }
                clearTimeout(timeout);
                pendingRequests.delete(reqId);
                reject(data.error.message);
            } else {
                // If we got a successful tick response through the regular flow
                if (data.tick) {
                    clearTimeout(timeout);
                    pendingRequests.delete(reqId);
                    resolve(data.tick.quote);
                }
            }
        }
    };

    sharedWs.onerror = (err) => {
        console.error("Deriv WS Error:", err);
    };

    sharedWs.onclose = () => {
        clearInterval(pingInterval);
        sharedWs = null;
        activeSubscriptions.clear();
        inFlightRequests.clear();
        pendingRequests.forEach(({ reject, timeout }) => {
            clearTimeout(timeout);
            reject("WebSocket Closed");
        });
        pendingRequests.clear();
    };

    return sharedWs;
};

const getDerivSymbol = (input) => {
    if (!input) return "";
    const clean = input.toString().toUpperCase().replace(/[^A-Z0-9]/g, ""); // Remove spaces/symbols

    // Synthetic Indices Mapping
    if (clean.includes("BOOM1000")) return "BOOM1000";
    if (clean.includes("BOOM500")) return "BOOM500";
    if (clean.includes("BOOM300")) return "BOOM300"; // Fix for Boom 300

    if (clean.includes("CRASH1000")) return "CRASH1000";
    if (clean.includes("CRASH500")) return "CRASH500";
    if (clean.includes("CRASH300")) return "CRASH300"; // Fix for Crash 300

    if (clean.includes("STEP")) return "STEP";

    // Volatility Indices
    if (clean === "V75" || clean === "VOLATILITY75" || clean === "VOLATILITY75INDEX") return "R_75";
    if (clean === "V100" || clean === "VOLATILITY100" || clean === "VOLATILITY100INDEX") return "R_100";
    if (clean === "V50" || clean === "VOLATILITY50" || clean === "VOLATILITY50INDEX") return "R_50";
    if (clean === "V25" || clean === "VOLATILITY25" || clean === "VOLATILITY25INDEX") return "R_25";
    if (clean === "V10" || clean === "VOLATILITY10" || clean === "VOLATILITY10INDEX") return "R_10";

    // 1s Indices
    if (clean === "V751S" || clean.includes("75(1S)")) return "1HZ75V";
    if (clean === "V1001S" || clean.includes("100(1S)")) return "1HZ100V";
    if (clean === "V501S" || clean.includes("50(1S)")) return "1HZ50V";
    if (clean === "V251S" || clean.includes("25(1S)")) return "1HZ25V";
    if (clean === "V101S" || clean.includes("10(1S)")) return "1HZ10V";

    // Jump Indices
    if (clean.includes("JUMP10")) return "JUMP_10";
    if (clean.includes("JUMP25")) return "JUMP_25";
    if (clean.includes("JUMP50")) return "JUMP_50";
    if (clean.includes("JUMP75")) return "JUMP_75";
    if (clean.includes("JUMP100")) return "JUMP_100";

    // Currency Pairs (Standard)
    if (clean === "EURUSD") return "frxEURUSD";
    if (clean === "GBPUSD") return "frxGBPUSD";
    if (clean === "USDJPY") return "frxUSDJPY";
    if (clean === "XAUUSD" || clean === "GOLD") return "frxXAUUSD";
    if (clean === "BTCUSD" || clean === "BITCOIN") return "cryBTCUSD";

    return clean;
};

/**
 * Fetch price safely with persistent subscriptions and de-duplication
 */
export const fetchPrice = (symbol) => {
    if (!symbol) return Promise.reject("No symbol provided");
    const normalized = getDerivSymbol(symbol);

    // 1. Instant Cache Return (Tactical Speed)
    if (activeSubscriptions.has(normalized)) {
        return Promise.resolve(activeSubscriptions.get(normalized));
    }

    // 2. Joining In-Flight Request (Prevent congestion)
    if (inFlightRequests.has(normalized)) {
        return inFlightRequests.get(normalized);
    }

    const promise = new Promise((resolve, reject) => {
        const ws = getSocket();
        const reqId = Date.now() + Math.round(Math.random() * 1000);

        const timeout = setTimeout(() => {
            if (pendingRequests.has(reqId)) {
                pendingRequests.delete(reqId);
                inFlightRequests.delete(normalized);
                reject(`Timeout ${normalized}`);
            }
        }, 12000); // Increased timeout for better resilience

        pendingRequests.set(reqId, {
            resolve: (val) => {
                inFlightRequests.delete(normalized);
                resolve(val);
            },
            reject: (err) => {
                inFlightRequests.delete(normalized);
                reject(err);
            },
            timeout,
            symbol: normalized
        });

        const sendRequest = () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    ticks: normalized,
                    subscribe: 1, // Strategic: Use persistent stream
                    req_id: reqId
                }));
            }
        };

        if (ws.readyState === WebSocket.OPEN) {
            sendRequest();
        } else {
            const onOpen = () => {
                ws.removeEventListener('open', onOpen);
                sendRequest();
            };
            ws.addEventListener('open', onOpen);
        }
    });

    inFlightRequests.set(normalized, promise);
    return promise;
};

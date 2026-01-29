/**
 * Deriv Boom 1000 Real-Time Chart - Candlestick Version
 * Uses WebSocket API and Lightweight Charts
 */

const CONFIG = {
    app_id: 1089,
    token: 'tOUA5PzEhX48Pfd',
    socket_url: 'wss://ws.binaryws.com/websockets/v3?app_id=1089'
};

// UI Elements
const priceElement = document.getElementById('live-price');
const changeElement = document.getElementById('price-change');
const statusBadge = document.getElementById('connection-status');
const statusText = statusBadge.querySelector('.status-text');

// State
let socket;
let chart;
let candleSeries;
let lastPrice = 0;
let isSubscribed = false;

/**
 * Initialize the Chart with Candlestick Series
 */
function initChart() {
    const chartContainer = document.getElementById('chart-container');
    chart = LightweightCharts.createChart(chartContainer, {
        layout: {
            background: { color: 'transparent' },
            textColor: '#8b949e',
            fontSize: 12,
            fontFamily: 'Inter',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            timeVisible: true,
            secondsVisible: true,
        },
    });

    try {
        // Use addCandlestickSeries for Japanese Candlesticks
        candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
    } catch (e) {
        console.error('Error creating candlestick series:', e);
        // Fallback for v4+ API if pinned version fails
        if (chart.addSeries) {
            candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
            });
        }
    }

    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight
        });
    });
}

/**
 * Connect to Deriv WebSocket
 */
function connect() {
    socket = new WebSocket(CONFIG.socket_url);

    socket.onopen = () => {
        console.log('Connected to Deriv API');
        updateStatus('Connected', 'connected');
        sendRequest({ authorize: CONFIG.token });
    };

    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        handleResponse(data);
    };

    socket.onclose = () => {
        updateStatus('Disconnected', 'error');
        setTimeout(connect, 5000);
    };

    socket.onerror = (error) => {
        console.error('Socket error:', error);
        updateStatus('Error', 'error');
    };
}

/**
 * Handle API Responses
 */
function handleResponse(data) {
    if (data.error) {
        console.error('API Error:', data.error.message);
        return;
    }

    if (data.msg_type === 'authorize') {
        // Find Boom 1000 symbol
        sendRequest({ active_symbols: 'brief', product_type: 'basic' });
    }

    if (data.msg_type === 'active_symbols') {
        const boom1000 = data.active_symbols.find(s =>
            s.display_name.toLowerCase().includes('boom 1000') ||
            s.symbol.includes('BOOM1000')
        );

        const symbol = boom1000 ? boom1000.symbol : 'R_100';
        console.log('Using symbol:', symbol);

        // Unified request for History + Subscription
        sendRequest({
            ticks_history: symbol,
            adjust_start_time: 1,
            count: 100,
            end: 'latest',
            style: 'candles',
            granularity: 60, // 1 minute candles
            subscribe: 1
        });
    }

    // Handle History
    if (data.msg_type === 'candles') {
        const history = data.candles.map(c => ({
            time: c.epoch,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
        }));
        candleSeries.setData(history);
    }

    // Handle real-time OHLC updates
    if (data.msg_type === 'ohlc') {
        const ohlc = data.ohlc;
        const candleData = {
            time: ohlc.open_time,
            open: parseFloat(ohlc.open),
            high: parseFloat(ohlc.high),
            low: parseFloat(ohlc.low),
            close: parseFloat(ohlc.close)
        };

        candleSeries.update(candleData);
        updatePriceUI(parseFloat(ohlc.close));
    }
}

/**
 * Send request via WebSocket
 */
function sendRequest(request) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(request));
    }
}

/**
 * Update UI Status
 */
function updateStatus(text, className) {
    statusBadge.className = `status-badge ${className}`;
    statusText.textContent = text;
}

/**
 * Update Price Display
 */
function updatePriceUI(price) {
    const diff = price - lastPrice;
    const percent = lastPrice ? (diff / lastPrice) * 100 : 0;

    priceElement.textContent = price.toFixed(4);

    if (lastPrice !== 0 && diff !== 0) {
        priceElement.classList.remove('up', 'down');
        void priceElement.offsetWidth;
        priceElement.classList.add(diff >= 0 ? 'up' : 'down');

        changeElement.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(4)} (${percent.toFixed(2)}%)`;
        changeElement.className = `price-change ${diff >= 0 ? 'up' : 'down'}`;
    }

    lastPrice = price;
}

// Start
initChart();
connect();

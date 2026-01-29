import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, CandlestickSeries } from 'lightweight-charts';
import { Activity, Clock } from 'lucide-react';
import TacticalSelect from '../../components/TacticalSelect';

const ChartsPage = () => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();
    const socketRef = useRef();
    const [selectedSymbol, setSelectedSymbol] = useState('BOOM1000');
    const [timeframe, setTimeframe] = useState(60);
    const [priceData, setPriceData] = useState({ price: 0, diff: 0, percent: 0 });
    const [status, setStatus] = useState('Connecting...');
    const [loadingData, setLoadingData] = useState(true);

    const CHART_OPTIONS = [
        {
            label: "BOOM INDICES",
            options: [
                { value: 'BOOM1000', label: 'BOOM 1000' },
                { value: 'BOOM500', label: 'BOOM 500' },
                { value: 'BOOM300', label: 'BOOM 300' },
            ]
        },
        {
            label: "CRASH INDICES",
            options: [
                { value: 'CRASH1000', label: 'CRASH 1000' },
                { value: 'CRASH500', label: 'CRASH 500' },
                { value: 'CRASH300', label: 'CRASH 300' },
                { value: 'CRASH600', label: 'CRASH 600' },
                { value: 'CRASH900', label: 'CRASH 900' },
            ]
        }
    ];

    const symbols = [
        { id: 'BOOM1000', label: 'BOOM 1000', derivSymbol: 'BOOM1000', group: 'BOOM' },
        { id: 'BOOM500', label: 'BOOM 500', derivSymbol: 'BOOM500', group: 'BOOM' },
        { id: 'BOOM300', label: 'BOOM 300', derivSymbol: 'BOOM300', group: 'BOOM' },
        { id: 'CRASH1000', label: 'CRASH 1000', derivSymbol: 'CRASH1000', group: 'CRASH' },
        { id: 'CRASH500', label: 'CRASH 500', derivSymbol: 'CRASH500', group: 'CRASH' },
        { id: 'CRASH300', label: 'CRASH 300', derivSymbol: 'CRASH300', group: 'CRASH' },
        { id: 'CRASH600', label: 'CRASH 600', derivSymbol: 'CRASH600', group: 'CRASH' },
        { id: 'CRASH900', label: 'CRASH 900', derivSymbol: 'CRASH900', group: 'CRASH' },
    ];

    const timeframes = [
        { label: '1M', value: 60 },
        { label: '5M', value: 300 },
        { label: '15M', value: 900 },
        { label: '1H', value: 3600 },
    ];

    // 1. Initial Chart Setup (Runs Once)
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#94a3b8',
                fontSize: 10,
                fontFamily: 'Inter, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: '#ef4444', width: 1, style: 2, labelVisible: true },
                horzLine: { color: '#ef4444', width: 1, style: 2, labelVisible: true },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                scaleMargins: { top: 0.1, bottom: 0.2 },
                autoScale: true,
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 5,
                barSpacing: 6,
            },
            handleScroll: true,
            handleScale: true,
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            priceLineVisible: true,
            lastValueVisible: true,
        });

        chartRef.current = chart;
        candleSeriesRef.current = series;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0].contentRect) {
                const { width, height } = entries[0].contentRect;
                chart.resize(width, height);
            }
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []);

    // 2. Data Connection (Depends on Symbol/Timeframe)
    useEffect(() => {
        setLoadingData(true);
        setStatus('Syncing...');

        if (candleSeriesRef.current) {
            candleSeriesRef.current.setData([]);
        }

        const connectDeriv = () => {
            if (socketRef.current) {
                socketRef.current.close();
            }

            const socket_url = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';
            const socket = new WebSocket(socket_url);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus('Connected');
                const current = symbols.find(s => s.id === selectedSymbol);
                socket.send(JSON.stringify({
                    ticks_history: current.derivSymbol,
                    adjust_start_time: 1,
                    count: 300,
                    end: 'latest',
                    style: 'candles',
                    granularity: timeframe,
                    subscribe: 1
                }));
            };

            socket.onmessage = (msg) => {
                const data = JSON.parse(msg.data);

                if (data.msg_type === 'candles') {
                    const history = data.candles.map(c => ({
                        time: c.epoch,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close
                    }));
                    candleSeriesRef.current.setData(history);
                    chartRef.current.timeScale().fitContent();
                    setLoadingData(false);
                }

                if (data.msg_type === 'ohlc') {
                    const ohlc = data.ohlc;
                    const candleData = {
                        time: ohlc.open_time,
                        open: parseFloat(ohlc.open),
                        high: parseFloat(ohlc.high),
                        low: parseFloat(ohlc.low),
                        close: parseFloat(ohlc.close)
                    };
                    candleSeriesRef.current.update(candleData);

                    setPriceData(prev => {
                        const price = parseFloat(ohlc.close);
                        const diff = prev.price ? price - prev.price : 0;
                        const percent = prev.price ? (diff / prev.price) * 100 : 0;
                        return { price, diff, percent };
                    });
                }
            };

            socket.onclose = (e) => {
                if (!e.wasClean) {
                    setStatus('Reconnect...');
                    setTimeout(connectDeriv, 2000);
                }
            };

            socket.onerror = () => setStatus('Socket Error');
        };

        connectDeriv();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedSymbol, timeframe]);

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
            {/* Header / Stats Panel */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 bg-black p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 flex items-center justify-center shadow-red-glow">
                            <Activity className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black italic tracking-tighter leading-none uppercase">
                                <span className="text-white">IndexGenius</span> <span className="text-red-600 font-bold">LIVE</span>
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                                <span className="text-[8px] font-black text-gray-500 tracking-[0.2em] uppercase">{status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-[180px] lg:w-[250px]">
                        <TacticalSelect
                            options={CHART_OPTIONS}
                            value={selectedSymbol}
                            onChange={val => {
                                setSelectedSymbol(val);
                                setPriceData({ price: 0, diff: 0, percent: 0 });
                            }}
                            placeholder="SELECT ASSET"
                        />
                    </div>
                </div>

                <div className="bg-black p-4 border border-white/5 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={12} className="text-red-600" />
                        <span className="text-[9px] font-black tracking-widest uppercase">Timeframe</span>
                    </div>
                    <div className="flex gap-1">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`w-10 h-8 text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center ${timeframe === tf.value
                                    ? 'bg-white text-black'
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Live Price', val: priceData.price.toFixed(4), color: 'text-white' },
                    { label: 'Change', val: `${priceData.diff >= 0 ? '+' : ''}${priceData.diff.toFixed(4)}`, color: priceData.diff >= 0 ? 'text-green-500' : 'text-red-500' },
                    { label: 'Percent', val: `${priceData.diff >= 0 ? '+' : ''}${priceData.percent.toFixed(2)}%`, color: priceData.diff >= 0 ? 'text-green-500' : 'text-red-500' },
                ].map((card, i) => (
                    <div key={i} className="bg-black/50 p-4 border border-white/5 flex flex-col items-center justify-center relative group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-red-600/20 group-hover:w-full transition-all"></div>
                        <span className="text-[8px] font-black text-gray-600 tracking-[0.3em] uppercase mb-1">{card.label}</span>
                        <div className={`text-xl lg:text-3xl font-black italic tracking-tighter ${card.color}`}>
                            {priceData.price === 0 ? '---' : card.val}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Container */}
            <div className="flex-1 bg-black border border-white/10 relative group overflow-hidden">
                <div ref={chartContainerRef} className="absolute inset-0" />

                {loadingData && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black text-red-600 tracking-[0.4em] uppercase animate-pulse">Synchronizing Terminal...</span>
                    </div>
                )}

                {/* Tactical Legend */}
                <div className="absolute top-6 right-6 pointer-events-none flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic opacity-60">High Volat Zone</span>
                        <div className="w-3 h-[2px] bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest italic opacity-60">Trend Decay Zone</span>
                        <div className="w-3 h-[2px] bg-red-600 shadow-[0_0_8px_#ef4444]"></div>
                    </div>
                </div>

                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10"></div>
            </div>
        </div>
    );
};

export default ChartsPage;

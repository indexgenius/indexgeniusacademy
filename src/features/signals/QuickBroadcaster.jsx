import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { fetchPrice } from '../../utils/deriv';

const DERIV_INDICES = [
    { name: 'BOOM 1000', symbol: 'BOOM1000', type: 'BOOM', category: 'BOOM' },
    { name: 'BOOM 900', symbol: 'BOOM900', type: 'BOOM', category: 'BOOM' },
    { name: 'BOOM 600', symbol: 'BOOM600', type: 'BOOM', category: 'BOOM' },
    { name: 'BOOM 500', symbol: 'BOOM500', type: 'BOOM', category: 'BOOM' },
    { name: 'BOOM 300', symbol: 'BOOM300', type: 'BOOM', category: 'BOOM' },
    { name: 'CRASH 1000', symbol: 'CRASH1000', type: 'CRASH', category: 'CRASH' },
    { name: 'CRASH 900', symbol: 'CRASH900', type: 'CRASH', category: 'CRASH' },
    { name: 'CRASH 600', symbol: 'CRASH600', type: 'CRASH', category: 'CRASH' },
    { name: 'CRASH 500', symbol: 'CRASH500', type: 'CRASH', category: 'CRASH' },
    { name: 'CRASH 300', symbol: 'CRASH300', type: 'CRASH', category: 'CRASH' },
];

const WELTRADE_INDICES = [
    { name: 'GainX 400', symbol: 'GainX400', type: 'BOOM', category: 'BOOM' },
    { name: 'GainX 600', symbol: 'GainX600', type: 'BOOM', category: 'BOOM' },
    { name: 'GainX 800', symbol: 'GainX800', type: 'BOOM', category: 'BOOM' },
    { name: 'GainX 999', symbol: 'GainX999', type: 'BOOM', category: 'BOOM' },
    { name: 'GainX 1200', symbol: 'GainX1200', type: 'BOOM', category: 'BOOM' },
    { name: 'PainX 400', symbol: 'PainX400', type: 'CRASH', category: 'CRASH' },
    { name: 'PainX 600', symbol: 'PainX600', type: 'CRASH', category: 'CRASH' },
    { name: 'PainX 800', symbol: 'PainX800', type: 'CRASH', category: 'CRASH' },
    { name: 'PainX 999', symbol: 'PainX999', type: 'CRASH', category: 'CRASH' },
    { name: 'PainX 1200', symbol: 'PainX1200', type: 'CRASH', category: 'CRASH' },
];

const BM_INDICES = [
    { name: 'BullX 1000', symbol: 'BullX1000', type: 'BOOM', category: 'BOOM' },
    { name: 'BullX 900', symbol: 'BullX900', type: 'BOOM', category: 'BOOM' },
    { name: 'BullX 777', symbol: 'BullX777', type: 'BOOM', category: 'BOOM' },
    { name: 'BullX 500', symbol: 'BullX500', type: 'BOOM', category: 'BOOM' },
    { name: 'BullX 400', symbol: 'BullX400', type: 'BOOM', category: 'BOOM' },
    { name: 'BearX 1000', symbol: 'BearX1000', type: 'CRASH', category: 'CRASH' },
    { name: 'BearX 900', symbol: 'BearX900', type: 'CRASH', category: 'CRASH' },
    { name: 'BearX 777', symbol: 'BearX777', type: 'CRASH', category: 'CRASH' },
    { name: 'BearX 500', symbol: 'BearX500', type: 'CRASH', category: 'CRASH' },
    { name: 'BearX 400', symbol: 'BearX400', type: 'CRASH', category: 'CRASH' },
];

const QuickBroadcaster = ({ broadcastSignal }) => {
    const [broker, setBroker] = useState('DERIV');
    const [selectedIndex, setSelectedIndex] = useState(DERIV_INDICES[0]);
    const [prices, setPrices] = useState({});
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [sl, setSl] = useState('');
    const [tp, setTp] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [manualEntry, setManualEntry] = useState('');

    const currentIndices = broker === 'DERIV' ? DERIV_INDICES : (broker === 'WELTRADE' ? WELTRADE_INDICES : BM_INDICES);

    useEffect(() => {
        if (broker !== 'DERIV') return;
        const updateAllPrices = async () => {
            const newPrices = { ...prices };
            for (const idx of DERIV_INDICES) {
                try {
                    const price = await fetchPrice(idx.symbol);
                    if (price) newPrices[idx.symbol] = price;
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) { }
            }
            setPrices(newPrices);
        };
        updateAllPrices();
        const interval = setInterval(updateAllPrices, 5000);
        return () => clearInterval(interval);
    }, [broker]);

    const sendSignal = async (action, idx) => {
        setLoadingIndex(idx.name);
        try {
            let price = manualEntry || 'MARKET PRICE';
            if (!manualEntry && broker === 'DERIV') {
                price = await fetchPrice(idx.symbol).catch(() => "MARKET PRICE");
            }

            const isBoom = idx.type === 'BOOM';
            const directionLabel = isBoom ? '🚀 COMPRA' : '❄️ VENTA';
            const slText = sl ? ` | SL: ${sl}` : '';
            const tpText = tp ? ` | TP: ${tp}` : '';

            let msg = "";
            if (action === 'MAIN') msg = `${directionLabel} ${idx.name} @ ${price}${slText}${tpText}`;
            if (action === 'REENTRY') msg = `🔄 RE-ENTRADA ${idx.name} @ ${price}${slText}${tpText}`;

            await broadcastSignal({
                title: 'IndexGenius ACADEMY - SIGNAL',
                message: msg,
                pair: idx.name,
                type: idx.type,
                status: 'ACTIVE',
                symbol: idx.symbol,
                entry: price.toString(),
                sl: sl || '---',
                tp: tp || '---',
                broker: broker
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingIndex(null);
        }
    };

    return (
        <div className="flex flex-col gap-0 lg:gap-6">
            <div className="flex items-center justify-between border-b border-white/5 p-4 lg:pb-4 lg:px-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 flex items-center justify-center shadow-red-glow"><Plus className="text-white" size={16} /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">INITIATE TACTICAL</span>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 scale-90 lg:scale-100 origin-right">
                    <button
                        onClick={() => { setBroker('DERIV'); setSelectedIndex(DERIV_INDICES[0]); }}
                        className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${broker === 'DERIV' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        DERIV
                    </button>
                    <button
                        onClick={() => { setBroker('WELTRADE'); setSelectedIndex(WELTRADE_INDICES[0]); }}
                        className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${broker === 'WELTRADE' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        WELTRADE
                    </button>
                    <button
                        onClick={() => { setBroker('BM'); setSelectedIndex(BM_INDICES[0]); }}
                        className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${broker === 'BM' ? 'bg-yellow-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        BM
                    </button>
                </div>
            </div>

            <div className="bg-black lg:bg-white/5 border-b lg:border border-white/10 p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="relative">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">TARGET PAIR</label>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white/5 p-3 text-white font-black tracking-wider uppercase border border-white/10 flex justify-between items-center transition-all">
                        <span>{selectedIndex.name} {broker === 'DERIV' && prices[selectedIndex.symbol] && <span className="text-green-500 ml-2">[{prices[selectedIndex.symbol]}]</span>}</span>
                        <div className={`w-2 h-2 border-r-2 border-b-2 border-white/50 transform ${isDropdownOpen ? 'rotate-[225deg]' : 'rotate-45'}`}></div>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full bg-[#0a0a0a] border border-white/20 z-50 max-h-60 overflow-auto">
                            {currentIndices.map(idx => (
                                <button key={idx.symbol} onClick={() => { setSelectedIndex(idx); setIsDropdownOpen(false); }} className="w-full p-3 text-left hover:bg-white/10 text-xs font-bold uppercase transition-all flex justify-between">
                                    {idx.name} {broker === 'DERIV' && <span className="text-gray-500">{prices[idx.symbol]}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="ENTRY PRICE (OPTIONAL)" className="w-full bg-white/5 border border-white/10 p-3 text-white text-[10px] uppercase font-black outline-none focus:border-blue-500 transition-colors" value={manualEntry} onChange={e => setManualEntry(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="SL PRICE" className="w-full bg-white/5 border border-white/10 p-3 text-white text-[10px] uppercase font-black outline-none" value={sl} onChange={e => setSl(e.target.value)} />
                    <input type="text" placeholder="TP PRICE" className="w-full bg-white/5 border border-white/10 p-3 text-white text-[10px] uppercase font-black outline-none" value={tp} onChange={e => setTp(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {['MAIN', 'REENTRY'].map(act => (
                        <button key={act} disabled={loadingIndex === selectedIndex.name} onClick={() => sendSignal(act, selectedIndex)} className={`py-4 text-[9px] font-black uppercase tracking-tighter transition-all border ${act === 'MAIN' ? (broker === 'DERIV' ? 'bg-red-600' : (broker === 'WELTRADE' ? 'bg-blue-600' : 'bg-yellow-600')) + ' text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                            {loadingIndex === selectedIndex.name ? <Loader2 className="animate-spin mx-auto" size={12} /> : (act === 'MAIN' ? (selectedIndex.type === 'BOOM' ? 'BUY' : 'SELL') : act)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickBroadcaster;

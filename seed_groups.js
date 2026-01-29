import { db } from './src/firebase.js';
import { collection, setDoc, doc } from 'firebase/firestore';

const seedGroups = async () => {
    const groups = [
        { id: 'vip_elite', name: 'V.I.P ELITE SIGNALS', members: 1200, status: 'PRIVATE', desc: 'Surgical accuracy for accounts over $5,000.', icon: 'ShieldCheck', color: 'text-red-600', activity: 'Ultra' },
        { id: 'index_warriors', name: 'INDEX WARRIORS', members: 8500, status: 'PUBLIC', desc: 'Daily analysis and global community signals.', icon: 'Globe', color: 'text-white', activity: 'High' },
        { id: 'ai_hedge', name: 'AI HEDGE BOT', members: 450, status: 'BOT', desc: '24/7 Automated signals powered by neural networks.', icon: 'MessageSquare', color: 'text-green-500', activity: 'Medium' },
    ];

    for (const group of groups) {
        await setDoc(doc(db, "groups", group.id), group);
        console.log(`Seeded group: ${group.name}`);
    }
};

seedGroups();

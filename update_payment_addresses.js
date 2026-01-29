import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBNZjJC1tc0LtT3y4DouPVkSZbCusW2w2I",
    authDomain: "ingenius-f33a6.firebaseapp.com",
    projectId: "ingenius-f33a6",
    storageBucket: "ingenius-f33a6.firebasestorage.app",
    messagingSenderId: "174110254614",
    appId: "1:174110254614:web:26446b0790fc9fcf723737",
    measurementId: "G-5LWJ345KWS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nuevas direcciones de pago
const newPaymentMethods = [
    {
        name: "USDT TRC20",
        value: "TASF23cMtiw9Cxt9UkP8puy9Fsp5PdfwA9",
        category: "CRIPTO",
        icon: "usdt",
        owner: "STEVEN CASTILLO"
    },
    {
        name: "USDT BEP20",
        value: "0x5cbf47ac13c96d4d2c38b447e51514d08f0d83a7",
        category: "CRIPTO",
        icon: "usdt",
        owner: "STEVEN CASTILLO"
    },
    {
        name: "BINANCE ID",
        value: "1132867046",
        category: "CRIPTO",
        icon: "binance",
        owner: "eltevenfx1"
    },
    {
        name: "PAYPAL",
        value: "stevencastillofx@gmail.com",
        category: "PAYPAL",
        icon: "paypal",
        owner: "STEVEN CASTILLO"
    }
];

async function updatePaymentAddresses() {
    try {
        console.log("🔄 Iniciando actualización de direcciones de pago...\n");

        // 1. Obtener todos los métodos de pago actuales
        const paymentMethodsRef = collection(db, "payment_methods");
        const snapshot = await getDocs(paymentMethodsRef);

        console.log(`📊 Métodos de pago encontrados: ${snapshot.size}\n`);

        // 2. Mostrar métodos actuales
        console.log("📋 MÉTODOS ACTUALES:");
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.name}: ${data.value} (${data.category})`);
        });
        console.log("\n");

        // 3. Eliminar métodos de pago de CRIPTO antiguos
        console.log("🗑️  Eliminando métodos de pago CRIPTO antiguos...");
        const cryptoQuery = query(paymentMethodsRef, where("category", "==", "CRIPTO"));
        const cryptoSnapshot = await getDocs(cryptoQuery);

        for (const docSnapshot of cryptoSnapshot.docs) {
            await deleteDoc(doc(db, "payment_methods", docSnapshot.id));
            console.log(`   ✅ Eliminado: ${docSnapshot.data().name}`);
        }
        console.log("\n");

        // 4. Agregar nuevos métodos de pago
        console.log("➕ Agregando nuevos métodos de pago...");
        for (const method of newPaymentMethods) {
            await addDoc(paymentMethodsRef, method);
            console.log(`   ✅ Agregado: ${method.name} - ${method.value}`);
        }
        console.log("\n");

        // 5. Verificar actualización
        const updatedSnapshot = await getDocs(paymentMethodsRef);
        console.log("✨ MÉTODOS DE PAGO ACTUALIZADOS:");
        updatedSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.name}: ${data.value} (${data.category})`);
        });

        console.log("\n✅ ¡Actualización completada exitosamente!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error al actualizar direcciones:", error);
        process.exit(1);
    }
}

updatePaymentAddresses();

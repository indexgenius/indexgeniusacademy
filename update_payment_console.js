// ============================================
// SCRIPT PARA ACTUALIZAR DIRECCIONES DE PAGO
// ============================================
// 
// INSTRUCCIONES:
// 1. Abre la aplicación en tu navegador
// 2. Inicia sesión como administrador
// 3. Abre la consola del navegador (F12)
// 4. Copia y pega todo este código
// 5. Presiona Enter
//
// ============================================

(async function updatePaymentAddresses() {
    console.log("🔄 Iniciando actualización de direcciones de pago...\n");

    // Importar funciones necesarias de Firebase
    const { collection, getDocs, addDoc, deleteDoc, doc, query, where } = window.firebaseFirestore ||
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // Obtener referencia a Firestore (debe estar disponible globalmente en la app)
    const db = window.db || firebase.firestore();

    if (!db) {
        console.error("❌ No se pudo acceder a Firestore. Asegúrate de estar en la aplicación.");
        return;
    }

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
        }
    ];

    try {
        // 1. Obtener todos los métodos de pago actuales
        const paymentMethodsRef = collection(db, "payment_methods");
        const snapshot = await getDocs(paymentMethodsRef);

        console.log(`📊 Métodos de pago encontrados: ${snapshot.size}\n`);

        // 2. Mostrar métodos actuales
        console.log("📋 MÉTODOS ACTUALES:");
        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
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
        updatedSnapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            console.log(`   - ${data.name}: ${data.value} (${data.category})`);
        });

        console.log("\n✅ ¡Actualización completada exitosamente!");
        console.log("\n📝 RESUMEN:");
        console.log("   • USDT TRC20: TASF23cMtiw9Cxt9UkP8puy9Fsp5PdfwA9");
        console.log("   • USDT BEP20: 0x5cbf47ac13c96d4d2c38b447e51514d08f0d83a7");
        console.log("   • BINANCE ID: 1132867046 (eltevenfx1)");

    } catch (error) {
        console.error("❌ Error al actualizar direcciones:", error);
    }
})();

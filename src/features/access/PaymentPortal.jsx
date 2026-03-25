const checkPaymentStatus = async (forcedId) => {
    const paymentId = forcedId || paymentDetails?.payment_id;
    if (!paymentId) return;

    try {
        const status = await nowPaymentsService.getPaymentStatus(paymentId);
        const currentStatus = status.payment_status;

        console.log(`Estado NowPayments (${paymentId}):`, currentStatus);

        setPaymentStatus(currentStatus);

        // 🔥 VALIDAR USER
        const currentUser = user || auth.currentUser;

        if (!currentUser || !currentUser.uid) {
            console.error("❌ UID no disponible");
            return;
        }

        console.log("🔥 UID enviado:", currentUser.uid);

        // 🔥 SI YA ESTÁ PAGADO → ACTIVAMOS
        if (currentStatus === 'finished' || currentStatus === 'confirmed') {

            console.log("🔥 Pago confirmado → activando usuario...");

            const res = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId: paymentId,
                    uid: currentUser.uid // 🔥 FIX CLAVE
                })
            });

            const data = await res.json();
            console.log("Respuesta backend:", data);

            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);

            // 🔥 VALIDAR RESPUESTA REAL
            if (data.success) {
                alert("✅ PAGO CONFIRMADO - MEMBRESÍA ACTIVADA");

                // 🔥 REDIRIGE O REFRESCA
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } else {
                console.warn("⚠️ Pago detectado pero no activado aún");
            }
        }

    } catch (err) {
        console.error("Error al verificar estado:", err);
    }
};
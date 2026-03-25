const checkPaymentStatus = async (forcedId) => {
    const paymentId = forcedId || paymentDetails?.payment_id;
    if (!paymentId) return;

    try {
        const status = await nowPaymentsService.getPaymentStatus(paymentId);
        const currentStatus = status.payment_status;

        console.log(`Estado NowPayments (${paymentId}):`, currentStatus);

        setPaymentStatus(currentStatus);

        // 🔥 SI YA ESTÁ PAGADO → ACTIVAMOS
        if (currentStatus === 'finished' || currentStatus === 'confirmed') {

            console.log("🔥 Pago confirmado → activando usuario...");

            // 👇 LLAMADA DIRECTA AL BACKEND
            const res = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId: paymentId,
                    userId: user.uid
                })
            });

            const data = await res.json();
            console.log("Respuesta backend:", data);

            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);

            alert("✅ PAGO CONFIRMADO - MEMBRESÍA ACTIVADA");

            window.location.reload();
        }

    } catch (err) {
        console.error("Error al verificar estado:", err);
    }
};
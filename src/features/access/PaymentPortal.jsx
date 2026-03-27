import React, { useState } from "react";
import { auth } from "../../firebase"; // ✅ RUTA CORRECTA

const PaymentPortal = ({ user, paymentDetails, nowPaymentsService }) => {
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

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

            console.log("🔥 UID detectado:", currentUser.uid);

            // 🔥 SI YA ESTÁ PAGADO
            if (currentStatus === "finished" || currentStatus === "confirmed") {

                console.log("🔥 Pago confirmado → esperando activación automática...");

                if (pollingInterval) clearInterval(pollingInterval);
                setPollingInterval(null);

                alert("✅ PAGO CONFIRMADO - ACTIVANDO MEMBRESÍA...");

                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }

        } catch (err) {
            console.error("Error al verificar estado:", err);
        }
    };

    return (
        <div>
            <h2>Payment Portal</h2>

            <button onClick={() => checkPaymentStatus()}>
                Verificar Pago
            </button>

            {paymentStatus && (
                <p>Estado: {paymentStatus}</p>
            )}
        </div>
    );
};

export default PaymentPortal;
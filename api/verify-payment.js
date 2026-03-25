import { getFirestoreAccessToken, updatePaymentLog, activateUser } from '../lib/firebase-admin';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 🔥 ACEPTA uid O userId
        const { paymentId, uid, userId } = req.body;

        const finalUid = uid || userId;

        if (!paymentId || !finalUid) {
            return res.status(400).json({ error: "Missing paymentId or uid" });
        }

        const apiKey = process.env.NOWPAYMENTS_API_KEY;

        // 🔥 1. Verificar pago
        const npResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
            headers: { 'x-api-key': apiKey }
        });

        const npData = await npResponse.json();
        const status = npData.payment_status;

        console.log(`Payment ${paymentId} status: ${status}`);
        console.log(`Activating UID: ${finalUid}`);

        // 🔐 2. Token Firebase
        const token = await getFirestoreAccessToken(
            process.env.FIREBASE_CLIENT_EMAIL,
            process.env.FIREBASE_PRIVATE_KEY
        );

        const projectId = "indexgeniusacademy";

        // 📝 Log del pago
        await updatePaymentLog(token, projectId, paymentId, status);

        const successStatuses = ["finished", "confirmed", "confirming"];

        // 🔥 3. ACTIVAR USUARIO
        if (successStatuses.includes(status)) {

            await activateUser(token, projectId, finalUid);

            console.log("✅ Usuario activado correctamente");

            return res.status(200).json({
                success: true,
                status,
                message: "User activated"
            });
        }

        return res.status(200).json({
            success: false,
            pending: true,
            status,
            message: "Payment still processing"
        });

    } catch (error) {
        console.error("VERIFY ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
export default async function handler(req, res) {
  try {
    const data = req.body;

    const { payment_status, order_id } = data;

    console.log("🔥 Webhook recibido:", JSON.stringify(data, null, 2));

    // ❌ Validación básica
    if (!order_id) {
      console.log("❌ No order_id");
      return res.status(400).json({ error: "No order_id" });
    }

    // 🔥 EXTRAER UID
    const parts = order_id.split("_");
    const userId = parts[0];

    console.log("👤 UID extraído:", userId);

    if (!userId || userId.length < 20) {
      console.log("❌ UID inválido:", userId);
      return res.status(400).json({ error: "Invalid UID in order_id" });
    }

    // 🔥 SOLO SI PAGO COMPLETADO
    if (payment_status !== "finished" && payment_status !== "confirmed") {
      console.log("⏳ Pago aún no finalizado:", payment_status);
      return res.status(200).json({ status: payment_status });
    }

    console.log("💰 Pago confirmado, activando usuario...");

    // 🔑 TOKEN FIREBASE
    const token = await getFirestoreAccessToken(
      process.env.FIREBASE_CLIENT_EMAIL,
      process.env.FIREBASE_PRIVATE_KEY
    );

    const projectId = "indexgeniusacademy";

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=status&updateMask.fieldPaths=subscriptionActive&updateMask.fieldPaths=planId&updateMask.fieldPaths=planName&updateMask.fieldPaths=lastPayment`;

    // 🔥 AQUÍ DEFINES EL PLAN (PUEDES CAMBIARLO)
    const planId = "index-one";
    const planName = "INDEX ONE";

    const body = {
      fields: {
        status: { stringValue: "active" },
        subscriptionActive: { booleanValue: true },
        planId: { stringValue: planId },
        planName: { stringValue: planName },
        lastPayment: { timestampValue: new Date().toISOString() }
      }
    };

    const firebaseRes = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const firebaseData = await firebaseRes.text();

    console.log("🔥 Firebase response:", firebaseData);

    return res.status(200).json({
      success: true,
      userId,
      payment_status
    });

  } catch (error) {
    console.error("💥 ERROR WEBHOOK:", error);
    return res.status(500).json({ error: error.message });
  }
}
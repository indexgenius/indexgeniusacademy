export default async function handler(req, res) {
  try {
    const data = req.body;

    const { payment_status, order_id, payment_id } = data;

    console.log("Webhook recibido:", data);

    if (!order_id) {
      return res.status(400).json({ error: "No order_id" });
    }

    const userId = order_id.split("_")[0];

    if (!userId) {
      return res.status(400).json({ error: "No userId" });
    }

    // 👉 ACTUALIZAR FIREBASE
    const token = await getFirestoreAccessToken(
      process.env.FIREBASE_CLIENT_EMAIL,
      process.env.FIREBASE_PRIVATE_KEY
    );

    const projectId = "indexgeniusacademy";

    if (payment_status === "finished" || payment_status === "confirmed") {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=status&updateMask.fieldPaths=subscriptionActive`;

      await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            status: { stringValue: "active" },
            subscriptionActive: { booleanValue: true }
          }
        })
      });

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ status: payment_status });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
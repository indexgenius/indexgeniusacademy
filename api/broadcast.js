import admin from "firebase-admin";

const serviceAccount = {
  projectId: "indexgeniusacademy",
  clientEmail: "firebase-adminsdk-fbsvc@indexgeniusacademy.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJejZX6Gbjt2x6\n5Wg5ha5CeiqwvobcQJEITFNRqWrRxWcOnTeNcSjydEIUV/3VRCCZVaeZuaOq4a//\n42GwS3K7rDerN2qWmJAnIMtWjzkPTxZtRlj0LFrnurO9CMf1U/er+HpNRYxF90s9\nZcAhe1W7GWujuR2E1/i1jzS1yMv8ZlGUOiXNi5GR4SOLeqLF0Yt9NKyEM8RUsp+m\ndqQC79WSrtZZvC0+e6QklT5iXDNUflzrxQ3VaNTOQYA1dTUz7Vcy4ReAtDij9uUb\n40eraJVkMi0C5/0XpkAwa66eC2ukFo2cxReyTIxJJCUki25WIrhhiozWFiDOvHFW\nBbB/LtXbAgMBAAECggEAAtkVzsUb1Z9qJFj9BPmJ+3aVBxqQw9xFyinW1t8TAeDm\n3zxpsWrzR6CASDlWMgWPts5djonvpLxVkioGReLkveWZUKcTFdd72JG/tHshzo2X\npSoxZ7VlmfdedkJn6ssQQ5lBLiAL85E87W+nktGWswzEI/RVIbBldThcNMjTcvKy\ndi5GCYuuIbNQLxRguNZcRrBiXydvILfMqs9wuK6c1i0xDJM0UzcbxGuN1/2793iu\n2f6vYTme8dK9F4H8HQEpQyxC/ggyrudzUz151NFcbIAyl598xaG6b5lMmVWWA81f\n8lgCaR61hXmoTeYan6JneUYDljmcto3oZpk5KBwfgQKBgQD8NUR1/5oe6tn5BNG1\nJxnyQQxPXZ5swQ27l3tmp+L9dzXrhcX3ITzcqoW8LBCdnnBCzsOSCY1M9arwwT85\nAoGu9kUi0BboAsR7Uwv7YjH6n2Fn0/4XgI5Aod0kO4S+ljut7exLcFzQcnE29Fjw\nIzNnijLpmxm/vSl+8Tnq7oElSQKBgQDMga+MCnvtaEloph4miqHY1Z6QkRUnV138\nihaPj2grO6FdvR8U8rwvuz4xNGwYB+SP3gSkDlgq7cm023wrVt8XyQKY+ZIQUzuG\nOOxyHlPii2Ltd7wGqaLP4YgTKcUyo7BGx55yogOQPJ5SPCH9RsSsrLTpr5nanJEG\nXwqfnV42AwKBgE7cKQfsYDiCnp1qkFfgXhCNnlfCoiLHSo/5kbBLloJCoC2AqqHX\nVrx45VAtRxTB0cBR/nzPV8tUlZqqEia1Te9zObLk9gSduOoG0ZxM2+vNohthAfY/\nUDuNYSRPJ/af6xE7b8M24w6aeiQAyz5rA0vAvqKkyKxXbX4v1zhKUz9hAoGAST5p\nUQ6wM+cV45UbV1JvhOl9UOmlWeHAl6IdUm1aMaG5uYjyiN4m6DF3pMfRrwmkoqIx\np1A746Qmic/SOPN0E2C6vW8lERO+TeQ1SunxwUGKvOIVRY2b8jgkNDjRl8FocPEt\nnoDIJfCQA4Pl6IBgEDgK02dBAzrv9gg0FdaW12ECgYBbRVnh4AmNZUau9VO4qNKO\npSnYrjMR/WhGrQfZoM9MymCreNaAEbiqhniHhGmXz8ToCsJd9kp8u42nvbe2hbsG\naaABEvfoxbKFct6r3+OMxkxmqWDvefZVJBJc8a0NWKmHJ8H6LhxWHlY7zK+GUSOY\nuzj2W0k848tMZEehRA7VLw==\n-----END PRIVATE KEY-----\n"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("fcm_tokens").get();

    if (snapshot.empty) {
      return res.status(400).json({ error: "No users" });
    }

    const tokens = snapshot.docs.map(doc => doc.id);

    const message = {
      notification: {
        title: "📊 IndexGenius",
        body: "Nueva señal disponible 🚀"
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.status(200).json({
      success: true,
      sent: response.successCount
    });

  } catch (error) {
    console.error("BROADCAST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}
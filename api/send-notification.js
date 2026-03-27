import admin from "firebase-admin";

const serviceAccount = {
  projectId: "indexgeniusacademy",
  clientEmail: "firebase-adminsdk-fbsvc@indexgeniusacademy.iam.gserviceaccount.com",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJejZX6Gbjt2x6
5Wg5ha5CeiqwvobcQJEITFNRqWrRxWcOnTeNcSjydEIUV/3VRCCZVaeZuaOq4a//
42GwS3K7rDerN2qWmJAnIMtWjzkPTxZtRlj0LFrnurO9CMf1U/er+HpNRYxF90s9
ZcAhe1W7GWujuR2E1/i1jzS1yMv8ZlGUOiXNi5GR4SOLeqLF0Yt9NKyEM8RUsp+m
dqQC79WSrtZZvC0+e6QklT5iXDNUflzrxQ3VaNTOQYA1dTUz7Vcy4ReAtDij9uUb
40eraJVkMi0C5/0XpkAwa66eC2ukFo2cxReyTIxJJCUki25WIrhhiozWFiDOvHFW
BbB/LtXbAgMBAAECggEAAtkVzsUb1Z9qJFj9BPmJ+3aVBxqQw9xFyinW1t8TAeDm
3zxpsWrzR6CASDlWMgWPts5djonvpLxVkioGReLkveWZUKcTFdd72JG/tHshzo2X
pSoxZ7VlmfdedkJn6ssQQ5lBLiAL85E87W+nktGWswzEI/RVIbBldThcNMjTcvKy
di5GCYuuIbNQLxRguNZcRrBiXydvILfMqs9wuK6c1i0xDJM0UzcbxGuN1/2793iu
2f6vYTme8dK9F4H8HQEpQyxC/ggyrudzUz151NFcbIAyl598xaG6b5lMmVWWA81f
8lgCaR61hXmoTeYan6JneUYDljmcto3oZpk5KBwfgQKBgQD8NUR1/5oe6tn5BNG1
JxnyQQxPXZ5swQ27l3tmp+L9dzXrhcX3ITzcqoW8LBCdnnBCzsOSCY1M9arwwT85
AoGu9kUi0BboAsR7Uwv7YjH6n2Fn0/4XgI5Aod0kO4S+ljut7exLcFzQcnE29Fjw
IzNnijLpmxm/vSl+8Tnq7oElSQKBgQDMga+MCnvtaEloph4miqHY1Z6QkRUnV138
ihaPj2grO6FdvR8U8rwvuz4xNGwYB+SP3gSkDlgq7cm023wrVt8XyQKY+ZIQUzuG
OOxyHlPii2Ltd7wGqaLP4YgTKcUyo7BGx55yogOQPJ5SPCH9RsSsrLTpr5nanJEG
XwqfnV42AwKBgE7cKQfsYDiCnp1qkFfgXhCNnlfCoiLHSo/5kbBLloJCoC2AqqHX
Vrx45VAtRxTB0cBR/nzPV8tUlZqqEia1Te9zObLk9gSduOoG0ZxM2+vNohthAfY/
UDuNYSRPJ/af6xE7b8M24w6aeiQAyz5rA0vAvqKkyKxXbX4v1zhKUz9hAoGAST5p
UQ6wM+cV45UbV1JvhOl9UOmlWeHAl6IdUm1aMaG5uYjyiN4m6DF3pMfRrwmkoqIx
p1A746Qmic/SOPN0E2C6vW8lERO+TeQ1SunxwUGKvOIVRY2b8jgkNDjRl8FocPEt
noDIJfCQA4Pl6IBgEDgK02dBAzrv9gg0FdaW12ECgYBbRVnh4AmNZUau9VO4qNKO
pSnYrjMR/WhGrQfZoM9MymCreNaAEbiqhniHhGmXz8ToCsJd9kp8u42nvbe2hbsG
aaABEvfoxbKFct6r3+OMxkxmqWDvefZVJBJc8a0NWKmHJ8H6LhxWHlY7zK+GUSOY
uzj2W0k848tMZEehRA7VLw==
-----END PRIVATE KEY-----`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  try {
    const { token, title, body } = req.body;

    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
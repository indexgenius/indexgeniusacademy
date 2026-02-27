
// Cloudflare Pages Function: NowPayments Webhook
// Path: functions/api/nowpayments-webhook.js

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const payload = await request.text();
        const signature = request.headers.get('x-nowpayments-sig');
        const secret = env.VITE_NOWPAYMENTS_IPN_SECRET;

        // Signature check if secret is provided (Optional but recommended)
        if (secret && signature) {
            // Verification logic would go here
        }

        const data = JSON.parse(payload);
        const { payment_status, order_id, payment_id } = data;

        console.log(`IPN Received: status=${payment_status}, order_id=${order_id}, payment_id=${payment_id}`);

        if (!order_id) return new Response("No order_id", { status: 400 });

        const parts = order_id.split('_');
        const userId = parts[0];

        const token = await getFirestoreAccessToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY);
        const projectId = "ingenius-f33a6";

        // 1. ALWAYS update payment log status
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
        const queryBody = {
            structuredQuery: {
                from: [{ collectionId: "payment_logs" }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: "paymentId" },
                        op: "EQUAL",
                        value: { stringValue: String(payment_id || "") }
                    }
                },
                limit: 1
            }
        };

        const queryResponse = await fetch(queryUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(queryBody)
        });

        const queryResults = await queryResponse.json();
        if (queryResults.length > 0 && queryResults[0].document) {
            const logName = queryResults[0].document.name;
            const updateLogUrl = `https://firestore.googleapis.com/v1/${logName}?updateMask.fieldPaths=status`;
            await fetch(updateLogUrl, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: { status: { stringValue: payment_status } } })
            });
        }

        // 2. ACTIVATE User if payment is confirmed/finished
        if (payment_status === "finished" || payment_status === "confirmed") {
            if (!userId) return new Response("No userId found in order_id", { status: 400 });

            console.log(`Activating user ${userId} via Webhook`);

            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=status&updateMask.fieldPaths=lastPayment&updateMask.fieldPaths=paymentMethod`;
            const patchBody = {
                fields: {
                    status: { stringValue: "approved" },
                    paymentMethod: { stringValue: "NowPayments" },
                    lastPayment: { timestampValue: new Date().toISOString() }
                }
            };

            await fetch(firestoreUrl, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(patchBody)
            });

            return new Response("OK - Activated", { status: 200 });
        }

        return new Response(`OK - Status ${payment_status} updated`, { status: 200 });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}

// Helper to get Google OAuth2 Token
async function getFirestoreAccessToken(email, privateKey) {
    if (!email || !privateKey) throw new Error("Missing Firebase credentials");

    const pk = privateKey.replace(/\\n/g, '\n');
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: email,
        scope: 'https://www.googleapis.com/auth/datastore',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const sHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const sClaim = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const unsignedToken = `${sHeader}.${sClaim}`;

    const encoder = new TextEncoder();
    const pemContents = pk.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsignedToken));
    const sSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = `${unsignedToken}.${sSignature}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    const data = await response.json();
    return data.access_token;
}

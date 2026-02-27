
// Cloudflare Pages Function: Verify NowPayments status and Activate User
// Path: functions/api/verify-payment.js

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { paymentId, userId } = await request.json();

        if (!paymentId || !userId) {
            return new Response(JSON.stringify({ error: "Missing paymentId or userId" }), { status: 400 });
        }

        const apiKey = env.VITE_NOWPAYMENTS_API_KEY; // or NOWPAYMENTS_API_KEY

        // 1. Check status with NowPayments
        const npResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
            headers: { 'x-api-key': apiKey }
        });
        const npData = await npResponse.json();

        console.log(`Verifying payment ${paymentId}: status = ${npData.payment_status}`);

        // 2. ALWAYS sync status with payment_log if it exists
        const token = await getFirestoreAccessToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY);
        const projectId = "ingenius-f33a6";

        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
        const queryBody = {
            structuredQuery: {
                from: [{ collectionId: "payment_logs" }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: "paymentId" },
                        op: "EQUAL",
                        value: { stringValue: String(paymentId) }
                    }
                },
                limit: 1
            }
        };

        const queryRes = await fetch(queryUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(queryBody)
        });

        const queryResults = await queryRes.json();
        if (queryResults.length > 0 && queryResults[0].document) {
            const logName = queryResults[0].document.name;
            const updateLogUrl = `https://firestore.googleapis.com/v1/${logName}?updateMask.fieldPaths=status`;
            await fetch(updateLogUrl, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: { status: { stringValue: npData.payment_status } } })
            });
        }

        // 3. ACTIVATE User only if finished/confirmed
        if (npData.payment_status === 'finished' || npData.payment_status === 'confirmed') {
            const fbUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=status&updateMask.fieldPaths=lastPayment&updateMask.fieldPaths=paymentMethod`;
            const fbBody = {
                fields: {
                    status: { stringValue: "approved" },
                    paymentMethod: { stringValue: "NowPayments" },
                    lastPayment: { timestampValue: new Date().toISOString() }
                }
            };

            await fetch(fbUrl, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(fbBody)
            });

            return new Response(JSON.stringify({ success: true, status: npData.payment_status }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        return new Response(JSON.stringify({ success: false, status: npData.payment_status }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
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

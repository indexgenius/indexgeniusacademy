export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { paymentId, userId } = await request.json();

        if (!paymentId || !userId) {
            return json({ error: "Missing paymentId or userId" }, 400);
        }

        const apiKey = env.VITE_NOWPAYMENTS_API_KEY;

        // 1. Check payment status
        const npResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
            headers: { 'x-api-key': apiKey }
        });

        const npData = await npResponse.json();
        const status = npData.payment_status;

        console.log(`Payment ${paymentId} status: ${status}`);

        const token = await getFirestoreAccessToken(
            env.FIREBASE_CLIENT_EMAIL,
            env.FIREBASE_PRIVATE_KEY
        );

        const projectId = "ingenius-f33a6";

        await updatePaymentLog(token, projectId, paymentId, status);

        const successStatuses = ["finished", "confirmed", "confirming"];

        if (successStatuses.includes(status)) {
            await activateUser(token, projectId, userId);

            return json({
                success: true,
                status,
                message: "User activated"
            });
        }

        return json({
            success: false,
            pending: true,
            status,
            message: "Payment still processing"
        });

    } catch (error) {
        console.error("VERIFY ERROR:", error);

        return json({
            success: false,
            error: error.message
        }, 500);
    }
}

// ================= HELPERS =================

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

async function updatePaymentLog(token, projectId, paymentId, status) {
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

    const res = await fetch(queryUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(queryBody)
    });

    const results = await res.json();

    if (results.length > 0 && results[0].document) {
        const logName = results[0].document.name;

        await fetch(`https://firestore.googleapis.com/v1/${logName}?updateMask.fieldPaths=status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    status: { stringValue: status }
                }
            })
        });
    }
}

async function activateUser(token, projectId, userId) {

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=status&updateMask.fieldPaths=subscriptionActive&updateMask.fieldPaths=lastPayment&updateMask.fieldPaths=paymentMethod`;

    await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                status: { stringValue: "active" }, // 🔥 CORREGIDO
                subscriptionActive: { booleanValue: true }, // 🔥 CLAVE
                paymentMethod: { stringValue: "NowPayments" },
                lastPayment: { timestampValue: new Date().toISOString() }
            }
        })
    });
}

// ================= AUTH =================

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

    const encode = obj =>
        btoa(JSON.stringify(obj))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

    const unsigned = `${encode(header)}.${encode(claim)}`;

    const encoder = new TextEncoder();
    const pem = pk
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        encoder.encode(unsigned)
    );

    const signed = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const jwt = `${unsigned}.${signed}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const data = await res.json();
    return data.access_token;
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
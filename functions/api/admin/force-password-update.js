
// Cloudflare Pages Function: Force Update User Password (Admin only)
// Path: functions/api/admin/force-password-update.js

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'https://indexgeniusacademy.com',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://indexgeniusacademy.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        // v1.0.1 - Forced deployment to sync Cloudflare Env Vars
        const { userId, newPassword } = await request.json();

        if (!userId || !newPassword) {
            return new Response(JSON.stringify({ error: "Faltan datos obligatorios (userId o password)" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        const projectId = env.VITE_FIREBASE_PROJECT_ID || "ingenius-f33a6";
        const clientEmail = env.FIREBASE_CLIENT_EMAIL;
        const privateKey = env.FIREBASE_PRIVATE_KEY;

        if (!clientEmail || !privateKey) {
            const missing = [];
            if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
            if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

            return new Response(JSON.stringify({
                error: `Faltan llaves en Cloudflare: ${missing.join(', ')}. Asegúrate de agregarlas en Settings -> Functions -> Environment Variables.`
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // 1. Obtener Token de OAuth para Identity Toolkit
        const token = await getAuthAccessToken(clientEmail, privateKey);

        // 2. Llamar a REST API de Firebase Auth para actualizar cuenta
        // Endpoint: https://identitytoolkit.googleapis.com/v1/projects/{projectId}/accounts:update
        const updateUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`;

        const updateRes = await fetch(updateUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                localId: userId,
                password: newPassword,
                overwrite: true
            })
        });

        const updateData = await updateRes.json();

        if (updateData.error) {
            return new Response(JSON.stringify({
                success: false,
                error: updateData.error.message || "Error al actualizar en Firebase Auth"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Contraseña actualizada correctamente en el sistema de seguridad."
        }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error("Force PW Update Error:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

// Helper to get Google OAuth2 Token specifically for Identity Toolkit
async function getAuthAccessToken(email, privateKey) {
    const pk = privateKey.replace(/\\n/g, '\n');
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: email,
        scope: 'https://www.googleapis.com/auth/identitytoolkit',
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

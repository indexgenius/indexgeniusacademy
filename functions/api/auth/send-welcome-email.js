export async function onRequestOptions(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const bodyText = await request.text();
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            body = {};
        }
        const { email, name, htmlContent } = body;

        const apiKey = env.VITE_BREVO_API_KEY || env.BREVO_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ success: false, error: 'API Key not configured in Cloudflare Environment variables' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        const brevoPayload = {
            sender: { name: "IndexGenius Academy", email: "soporte@indexgeniusacademy.com" },
            to: [{ email: email, name: name || "Nuevo Usuario" }],
            subject: "Bienvenido a IndexGenius Academy - Credenciales y Factura",
            htmlContent: htmlContent
        };

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(brevoPayload)
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            console.error("Brevo Error:", data);
            return new Response(JSON.stringify({ success: false, error: data.message || 'Error Brevo CF' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Email sent successfully via CF Brevo', messageId: data.messageId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ success: false, error: error.message || 'Failed to send CF email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

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

        const apiKey = env.VITE_BREVO_API_KEY || "xsmtpsib-261dd60e8b6481f6f1eec39317ebc4fa4083771df54725a67b6ed11a5f451304-Eq61uP7qeE50wRtx";

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

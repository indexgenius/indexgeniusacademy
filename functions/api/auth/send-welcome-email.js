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

        // Resend API Key hidden properly
        const apiKey = env.RESEND_API_KEY || "re_aTdXg4tq_tLQFVFA249x2h9YUACVrrngy";

        // IMPORTANTE: Al usar "onboarding@resend.dev" como remitente en una cuenta nueva, 
        // Resend de momento SOLO te permitirá enviar correos AL MISMO CORREO con el que creaste tu cuenta de Resend.
        const resendPayload = {
            from: "IndexGenius Academy <onboarding@resend.dev>",
            to: [email],
            subject: "Bienvenido a IndexGenius Academy - Credenciales y Factura",
            html: htmlContent
        };

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resendPayload)
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            console.error("Resend Error:", data);
            return new Response(JSON.stringify({ success: false, error: data.message || 'Error Resend' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Email sent successfully via Resend', id: data.id }), {
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

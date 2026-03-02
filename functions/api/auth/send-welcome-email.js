export async function onRequestOptions(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://indexgeniusacademy.com',
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
        'Access-Control-Allow-Origin': 'https://indexgeniusacademy.com',
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
        const { email, name, htmlContent, attachments } = body;

        // Function to fetch a file from URL and convert to Base64
        const fetchFileAsBase64 = async (url) => {
            try {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            } catch (e) {
                console.error("Fetch file error:", e);
                return null;
            }
        };

        const resendAttachments = [];
        if (attachments && Array.isArray(attachments)) {
            for (const att of attachments) {
                if (att.url) {
                    const content = await fetchFileAsBase64(att.url);
                    if (content) {
                        resendAttachments.push({
                            filename: att.filename || "document.pdf",
                            content: content
                        });
                    }
                }
            }
        }

        // Resend API Key from Cloudflare environment variable only
        const apiKey = env.RESEND_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        const resendPayload = {
            from: "IndexGenius Academy <support@indexgeniusacademy.com>",
            to: [email],
            subject: body.subject || "Bienvenido a IndexGenius Academy - Credenciales y Factura",
            html: htmlContent,
            attachments: resendAttachments.length > 0 ? resendAttachments : undefined
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

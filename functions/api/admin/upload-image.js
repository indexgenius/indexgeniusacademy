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
        // 1. Verificar si R2 está configurado
        const bucket = env.EMAIL_ASSETS_BUCKET || env.imgindexgenius;

        if (!bucket) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Bucket R2 no vinculado. En Cloudflare ve a Settings -> Functions -> R2 Bucket Bindings y vincula "imgindexgenius" a la variable "EMAIL_ASSETS_BUCKET".'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        let filename = formData.get('filename');

        if (!filename && file) {
            const ext = file.name ? file.name.split('.').pop() : (file.type === 'application/pdf' ? 'pdf' : 'png');
            filename = `asset_${Date.now()}.${ext}`;
        }

        if (!file) {
            return new Response(JSON.stringify({ success: false, error: 'No se recibió ningún archivo' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // 2. Subir a R2
        // El nombre del archivo será la llave en el bucket
        await bucket.put(filename, file, {
            httpMetadata: {
                contentType: file.type,
                cacheControl: 'public, max-age=31536000',
            }
        });

        // 3. Generar URL Pública
        // Nota: El bucket debe estar configurado como "Public Setup" en Cloudflare con un dominio o subdominio R2
        const publicUrlBase = env.R2_PUBLIC_URL || 'https://pub-c7a361632730477f8edb5a917dd41338.r2.dev';
        const publicUrl = `${publicUrlBase}/${filename}`;

        return new Response(JSON.stringify({
            success: true,
            url: publicUrl,
            filename: filename
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error('R2 Upload Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

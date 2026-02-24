export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

export async function onRequestPost(context) {
    const { request } = context;
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const bodyText = await request.text();
        let payloadInput;
        try {
            payloadInput = JSON.parse(bodyText);
        } catch (e) {
            payloadInput = {};
        }

        const { title, body, data, targetEmail } = payloadInput;

        const payload = {
            app_id: "04046e2f-a035-4a88-9842-147cf501c938",
            contents: { en: body || "New Signal Alert" },
            headings: { en: title || "IndexGeniusGOLD" },
            data: data || {},
            url: "https://www.indexgeniusacademy.com/",
            android_group: "index_genius_signals",
            ios_badgeType: "Increase",
            ios_badgeCount: 1
        };

        if (targetEmail) {
            payload.filters = [
                { field: "tag", key: "email", relation: "=", value: targetEmail }
            ];
            console.log(`Targeting specific user: ${targetEmail}`);
        } else {
            payload.included_segments = ["All"];
            console.log(`Targeting ALL users`);
        }

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic os_v2_app_aqcg4l5agvfirgcccr6pkaojhb7bgowau2duxc5zllpihjluzxww2guf7iu6kisqnzxekqbxzm2b2okuz23rfqtzfpw5ospqi4yqhfq'
            },
            body: JSON.stringify(payload)
        });

        let json;
        try {
            json = await response.json();
        } catch (e) {
            json = {};
        }

        if (json.errors && json.errors.length > 0) {
            console.error("OneSignal Errors:", json.errors);
        }

        return new Response(JSON.stringify({ success: true, os_response: json }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error('OneSignal Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const bodyPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { title, body, data, targetEmail } = bodyPayload || {}; // Adding targetEmail support

        console.log(`📡 OneSignal Broadcast: ${title} - ${body}`);

        // Construct OneSignal Payload
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

        // Targeting Logic
        if (targetEmail) {
            // Target specific user by Email Tag
            payload.filters = [
                { field: "tag", key: "email", relation: "=", value: targetEmail }
            ];
            console.log(`🎯 Targeting specific user: ${targetEmail}`);
        } else {
            // Broadcast to All (or filtered segments in future)
            payload.included_segments = ["All"];
            console.log(`🎯 Targeting ALL users`);
        }

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic os_v2_app_aqcg4l5agvfirgcccr6pkaojhb7bgowau2duxc5zllpihjluzxww2guf7iu6kisqnzxekqbxzm2b2okuz23rfqtzfpw5ospqi4yqhfq'
            },
            body: JSON.stringify(payload)
        });

        const json = await response.json();
        console.log("📦 OneSignal Payload Sent:", JSON.stringify(payload, null, 2));
        console.log("✅ OneSignal Response Status:", response.status);
        console.log("✅ OneSignal Response:", JSON.stringify(json, null, 2));

        // Check if OneSignal reported any errors
        if (json.errors && json.errors.length > 0) {
            console.error("❌ OneSignal Errors:", json.errors);
        }

        // Check if any recipients were reached
        if (json.recipients !== undefined) {
            console.log(`📊 Recipients: ${json.recipients}`);
            if (json.recipients === 0) {
                console.warn("⚠️ WARNING: No recipients received this notification!");
            }
        }

        return res.status(200).json({ success: true, os_response: json });

    } catch (error) {
        console.error('🔥 OneSignal Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

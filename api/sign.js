
import crypto from 'crypto';

export default async function handler(req, res) {
    // Cloudinary Credentials provided by user
    const API_SECRET = 'n2uudWXBpe7HBOTmy7B1dmKrvxQ';

    // 1. Generate Timestamp
    const timestamp = Math.round((new Date()).getTime() / 1000);

    // 2. Generate Signature
    // Signature is SHA1 of "timestamp=...&upload_preset=..." (if used) + secret
    // For standard signed upload we usually just need timestamp and potentially eager/transformation params.
    // Minimal signature: timestamp=X<secret>

    // Note: If we don't use a preset, we just sign the timestamp (and any other params we send).
    // Let's sign just the timestamp for a basic authenticated upload.
    const paramsToSign = `timestamp=${timestamp}`;

    const signature = crypto.createHash('sha1')
        .update(paramsToSign + API_SECRET)
        .digest('hex');

    res.status(200).json({
        signature,
        timestamp,
        cloud_name: 'doaxon6ed',
        api_key: '312735321451458'
    });
}

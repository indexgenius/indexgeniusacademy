// Google Identity Services + Drive API implementation
let tokenClient;
let accessToken = null;

const initTokenClient = () => {
    return new Promise((resolve) => {
        if (tokenClient) return resolve(tokenClient);

        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse) => {
                accessToken = tokenResponse.access_token;
                resolve(tokenClient);
            },
        });
        resolve(tokenClient);
    });
};

const loadGoogleScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const getAccessToken = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Force load scripts if they are missing
            await loadGoogleScript('https://accounts.google.com/gsi/client');
            await loadGoogleScript('https://apis.google.com/js/api.js');

            // Wait a bit for initialization
            let retries = 0;
            while ((!window.google || !window.google.accounts) && retries < 20) {
                await new Promise(r => setTimeout(r, 100));
                retries++;
            }

            if (!window.google || !window.google.accounts) {
                throw new Error("Google Identity Services failed to initialize.");
            }

            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (tokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        reject(tokenResponse);
                    }
                    accessToken = tokenResponse.access_token;
                    resolve(accessToken);
                },
            });
            client.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            reject(err);
        }
    });
};

export const uploadToDrive = async (file) => {
    try {
        const token = accessToken || await getAccessToken();

        // 1. Upload the file
        const metadata = {
            name: file.name,
            mimeType: file.type,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + token }),
            body: form,
        });

        const fileData = await uploadResponse.json();
        if (!fileData.id) throw new Error("Upload failed - No ID returned");

        // 2. Make the file public (Anyone with link can view) 
        // This fixes the CSP / Frame-ancestors error
        await fetch(`https://www.googleapis.com/api/drive/v3/files/${fileData.id}/permissions`, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone'
            }),
        });

        return `https://drive.google.com/file/d/${fileData.id}/view`;
    } catch (error) {
        console.error("Drive Service Error:", error);
        accessToken = null; // Reset token on error to force re-auth
        throw error;
    }
};

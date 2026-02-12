export const uploadToDrive = async (file) => {
    return new Promise((resolve, reject) => {
        const metadata = {
            name: file.name,
            mimeType: file.type,
        };

        const accessToken = window.gapi.auth.getToken()?.access_token;
        if (!accessToken) {
            reject(new Error("No access token found. Please authenticate."));
            return;
        }

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        })
            .then(response => response.json())
            .then(fileData => {
                if (fileData.id) {
                    // Return the direct view link
                    resolve(`https://drive.google.com/file/d/${fileData.id}/view`);
                } else {
                    reject(new Error("Failed to get file ID from Drive response"));
                }
            })
            .catch(error => reject(error));
    });
};

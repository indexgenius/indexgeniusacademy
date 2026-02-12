export const formatDrivePreview = (url) => {
    if (!url) return '';
    if (!url.includes('drive.google.com')) return url;

    try {
        // Handle /file/d/ID/view
        const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileDMatch) {
            return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
        }

        // Handle open?id=ID
        const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idParamMatch) {
            return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
        }

        // Handle other cases by cleaning up query params and replacing common suffixes
        const cleanUrl = url.split('?')[0].split('&')[0];
        return cleanUrl.replace('/view', '/preview').replace('/edit', '/preview');
    } catch (e) {
        console.warn("Drive URL formatting failed:", e);
        return url;
    }
};

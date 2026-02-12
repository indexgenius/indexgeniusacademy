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

export const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const formatYouTubeEmbed = (url) => {
    const id = getYouTubeID(url);
    const origin = window.location.origin;
    return id ? `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&iv_load_policy=3&autoplay=1&disablekb=1&widget_referrer=${encodeURIComponent(origin)}` : url;
};

export const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) return formatDrivePreview(url);
    if (url.includes('youtube.com') || url.includes('youtu.be')) return formatYouTubeEmbed(url);
    return url;
};

export const getYouTubeThumbnail = (url) => {
    const id = getYouTubeID(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

// Cloudinary Constants
const CLOUDINARY_CLOUD_NAME = 'doaxon6ed';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

export const videoService = {
    /**
     * Start a recording session
     * @returns {Promise<{stream: MediaStream, recorder: MediaRecorder, chunks: Blob[]}>}
     */
    startRecording: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: true
            });

            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            return { stream, recorder, chunks };
        } catch (err) {
            console.error("Tactical Recording Failed:", err);
            if (err.name === 'NotAllowedError') {
                throw new Error("ACCESO DENEGADO POR EL SISTEMA. Verifica: 1. Permisos del navegador. 2. Configuración de privacidad de Windows/Mac (Cámara/Micrófono).");
            } else if (err.name === 'NotFoundError') {
                throw new Error("NO SE DETECTA CÁMARA O MICRÓFONO.");
            } else {
                throw new Error("ERROR DE GRABACIÓN: " + err.message);
            }
        }
    },

    /**
     * Stop and process the recording
     * @param {MediaRecorder} recorder 
     * @param {MediaStream} stream 
     * @param {Blob[]} chunks 
     * @returns {Promise<Blob>}
     */
    stopRecording: (recorder, stream, chunks) => {
        return new Promise((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                // Stop all tracks to release camera
                stream.getTracks().forEach(track => track.stop());
                resolve(blob);
            };
            recorder.stop();
        });
    },

    /**
     * Upload a video to Cloudinary (Authenticated)
     * @param {Blob|File} videoFile 
     * @returns {Promise<{url: string, duration: number}>}
     */
    uploadVideo: async (videoFile) => {
        try {
            // 1. Get Signature from Backend
            const signRes = await fetch('/api/sign');
            const signData = await signRes.json();

            if (!signData.signature) throw new Error("Signature generation failed");

            // 2. Upload with Signature
            const formData = new FormData();
            formData.append('file', videoFile);
            formData.append('api_key', signData.api_key);
            formData.append('timestamp', signData.timestamp);
            formData.append('signature', signData.signature);
            // No upload_preset needed for signed upload usually, unless defined in backend params

            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.text();
                throw new Error('Upload Failed: ' + errData);
            }

            const data = await response.json();
            return {
                url: data.secure_url,
                duration: data.duration,
                id: data.public_id
            };
        } catch (err) {
            console.error("Upload Error:", err);
            throw err;
        }
    }
};

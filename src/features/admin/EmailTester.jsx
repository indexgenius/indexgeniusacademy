import React, { useState } from 'react';
import { Mail, Check, AlertTriangle, Send, Plus, Image, Eye, RefreshCw, Copy, FileText } from 'lucide-react';

const EmailTester = ({ adminUser }) => {
    const [testEmail, setTestEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [responseMsg, setResponseMsg] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('welcome_new'); // welcome_new, extension, standard, black_test
    const [rawHtml, setRawHtml] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    const [uploading, setUploading] = useState(false);
    const [flyerUrl, setFlyerUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [includeAttachment, setIncludeAttachment] = useState(false);

    const handleFileUpload = async (e, type = 'image') => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setStatus('idle');
        setResponseMsg('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', `${type}_${Date.now()}_${file.name.replace(/\s/g, '_')}`);

            let apiUrl = 'https://indexgeniusacademy.com/api/admin/upload-image';
            if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                apiUrl = '/api/admin/upload-image';
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (type === 'image') setFlyerUrl(data.url);
                else setPdfUrl(data.url);
                alert(`${type.toUpperCase()} SUBIDO A CLOUDFLARE CON ÉXITO`);
            } else {
                throw new Error(data.error || 'Fallo en la conexión con Cloudflare R2');
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("ERROR: Asegúrate de tener el bucket R2 configurado en Cloudflare.");
        } finally {
            setUploading(false);
        }
    };

    const getPopulatedHtml = async () => {
        if (selectedTemplate === 'raw_html') return rawHtml;
        if (selectedTemplate === 'compose') {
            return `
            <div style="background-color: #000; color: #fff; font-family: 'Inter', sans-serif; padding: 40px; text-align: center;">
                <img src="https://indexgeniusacademy.com/img/logos/IMG_5208.PNG" style="width: 80px; margin-bottom: 20px;" />
                <h1 style="font-style: italic; font-weight: 900; letter-spacing: -1px; margin-bottom: 30px; text-transform: uppercase;">INDEXGENIUS <span style="color: #ff0000;">ACADEMY</span></h1>
                <div style="background-color: #111; border: 1px solid #333; padding: 30px; text-align: left; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    ${customMessage.replace(/\n/g, '<br>')}
                </div>
                <p style="font-size: 10px; color: #666; margin-top: 40px; text-transform: uppercase; letter-spacing: 2px;">© 2026 INDEXGENIUS ACADEMY - ELITE TRADING UNIT</p>
            </div>
            `;
        }

        let templatePath = '/testemail.html';
        if (selectedTemplate === 'black_test') templatePath = '/testblack.html';
        if (selectedTemplate === 'welcome_new') templatePath = '/welcome-email.html';
        if (selectedTemplate === 'elite_welcome') templatePath = '/elite-welcome.html';
        if (selectedTemplate === 'extension') templatePath = '/extension-email.html';

        try {
            const responseHtml = await fetch(templatePath);
            if (!responseHtml.ok) throw new Error(`No se pudo cargar ${templatePath}`);
            let html = await responseHtml.text();

            // Populate mock data
            html = html.replace(/{{USER_NAME}}/g, "Tester Admin");
            html = html.replace(/{{PLAN_NAME}}/g, "PLAN DE PRUEBA VIP");
            html = html.replace(/{{PLAN_PRICE}}/g, "25.00");
            html = html.replace(/{{USER_EMAIL}}/g, testEmail || "admin@indexgenius.com");
            html = html.replace(/{{USER_PASSWORD}}/g, "PasswordSegura123!");
            html = html.replace(/{{DAYS_ADDED}}/g, "7");
            html = html.replace(/{{NEW_EXPIRY}}/g, "26 DE MARZO, 2026");

            return html;
        } catch (e) {
            console.error("Fetch Error:", e);
            throw e;
        }
    };

    const handlePreview = async () => {
        try {
            const html = await getPopulatedHtml();
            const previewWin = window.open('', '_blank');
            if (previewWin) {
                previewWin.document.write(html);
                previewWin.document.close();
            }
        } catch (e) {
            alert("Error al generar preview");
        }
    };

    const handleCopyHtml = async () => {
        try {
            const html = await getPopulatedHtml();
            await navigator.clipboard.writeText(html);
            alert("CÓDIGO HTML COPIADO AL PORTAPAPELES. ¡Ya puedes pegarlo donde quieras!");
        } catch (e) {
            alert("Error al copiar HTML");
        }
    };

    const handleTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmail) return;

        setStatus('loading');
        setResponseMsg('');

        try {
            const htmlContent = await getPopulatedHtml();

            let apiUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
                ? '/api/auth/send-welcome-email'
                : 'https://indexgeniusacademy.com/api/auth/send-welcome-email';

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    name: "Trader Elite",
                    subject: selectedTemplate === 'compose' ? customSubject : undefined,
                    htmlContent: htmlContent,
                    attachments: includeAttachment && pdfUrl ? [{ url: pdfUrl, filename: "GUIA_ACADEMY.pdf" }] : undefined
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setStatus('success');
                setResponseMsg('¡Correo enviado con éxito!');
            } else {
                throw new Error(data.error || 'Error al enviar');
            }
        } catch (error) {
            console.error("Test Email Error:", error);
            setStatus('error');
            setResponseMsg(error.message);
        }
    };

    return (
        <div className="bg-black border border-white/10 p-6 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center">
                    <Mail size={20} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">EMAIL & FACTURA TESTER</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prueba el envío de correos y adjuntos vía Brevo</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pt-2">
                <div className="flex flex-wrap bg-white/5 border border-white/10 p-1 self-start gap-1">
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('welcome_new')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'welcome_new' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        BIENVENIDA OFICIAL (NUEVA)
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('extension')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'extension' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        NOTIFICACIÓN EXTENSIÓN
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('standard')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'standard' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        BIENVENIDA ANTIGUA
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('black_test')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'black_test' ? 'bg-black border border-red-600 text-red-600 shadow-red-glow' : 'text-gray-500 hover:text-white'}`}
                    >
                        TEST NEGRO MÓVIL
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('elite_welcome')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'elite_welcome' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        BIENVENIDA ELITE
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('raw_html')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'raw_html' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        PEGAR HTML PROPIO
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('compose')}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === 'compose' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        REDACCIÓN LIBRE
                    </button>
                </div>
            </div>

            {selectedTemplate === 'compose' && (
                <div className="space-y-4 mb-8 bg-blue-600/5 border border-blue-600/30 p-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Asunto del Correo</label>
                        <input
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder="Escribe el título que verá el usuario..."
                            className="w-full bg-black/40 border border-blue-600/10 p-3 text-xs font-bold text-white outline-none focus:border-blue-600 transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Mensaje (Soporta múltiples líneas)</label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Redacta aquí tu comunicado oficial..."
                            className="w-full h-48 bg-black/40 border border-blue-600/10 p-4 text-xs font-medium text-white/90 outline-none focus:border-blue-600 transition-all resize-none"
                        />
                    </div>
                </div>
            )}

            {selectedTemplate === 'raw_html' && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <textarea
                        value={rawHtml}
                        onChange={(e) => setRawHtml(e.target.value)}
                        placeholder="<!-- Pega tu código HTML aquí -->"
                        className="w-full h-64 bg-white/5 border border-purple-500/30 p-4 text-xs font-mono text-purple-400 outline-none focus:border-purple-500 transition-all placeholder:text-purple-900"
                    />
                </div>
            )}

            {/* CLOUDFLARE R2 UPLOADER - IMAGES & PDF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
                {/* Image flyer subida */}
                <div className="bg-red-600/5 border border-red-600/30 p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-600/10 border border-red-600/20">
                            <Image className="text-red-600" size={16} />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tighter">SUBIDA DE FLYERS (PNG/JPG)</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="w-full h-12 flex items-center justify-center bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all border-dashed">
                            {uploading ? <RefreshCw className="text-red-600 animate-spin" size={12} /> : <span className="text-[9px] font-black text-white uppercase italic">ELEGIR IMAGEN</span>}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                        </label>
                        {flyerUrl && (
                            <input readOnly value={flyerUrl} className="w-full bg-black/40 text-[8px] font-mono text-white/50 p-2 outline-none" />
                        )}
                    </div>
                </div>

                {/* PDF subida */}
                <div className="bg-blue-600/5 border border-blue-600/30 p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600/10 border border-blue-600/20">
                            <FileText className="text-blue-500" size={16} />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tighter">SUBIDA DE GUÍAS (PDF)</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="w-full h-12 flex items-center justify-center bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all border-dashed">
                            {uploading ? <RefreshCw className="text-blue-500 animate-spin" size={12} /> : <span className="text-[9px] font-black text-white uppercase italic">ELEGIR PDF</span>}
                            <input type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} disabled={uploading} />
                        </label>
                        {pdfUrl && (
                            <div className="flex items-center gap-3">
                                <input readOnly value={pdfUrl} className="flex-1 bg-black/40 text-[8px] font-mono text-white/50 p-2 outline-none" />
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div onClick={() => setIncludeAttachment(!includeAttachment)} className={`w-10 h-5 rounded-full p-1 transition-all ${includeAttachment ? 'bg-green-600' : 'bg-gray-700'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-all ${includeAttachment ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-[8px] font-black text-white uppercase">ADJUNTAR</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleTestEmail} className="space-y-4 max-w-lg relative z-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Ingresa correo de destino</label>
                    <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="tu-correo@gmail.com"
                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-red-600 focus:bg-white/10 transition-all"
                        required
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex-1 min-w-[150px] py-4 bg-red-600 text-white font-black italic text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR PRUEBA'} <Send size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={handlePreview}
                        className="px-6 py-4 bg-white/5 border border-white/20 text-white font-black italic text-xs tracking-[0.3em] uppercase hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                    >
                        PREVIEW <Eye size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyHtml}
                        className="px-6 py-4 bg-purple-900/20 border border-purple-500/30 text-purple-400 font-black italic text-[9px] tracking-[0.2em] uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                        COPIAR HTML <Copy size={16} />
                    </button>
                </div>
            </form>

            {status === 'success' && (
                <div className="mt-6 bg-green-500/10 border border-green-500 p-4 flex items-center gap-4 animate-pulse">
                    <Check className="text-green-500 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-green-500 uppercase">{responseMsg}</p>
                        <p className="text-[9px] text-green-500/70 uppercase">Revisa tu bandeja de entrada o spam.</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="mt-6 bg-red-500/10 border border-red-500 p-4 flex items-center gap-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-red-500 uppercase">FALLO EN EL ENVÍO</p>
                        <p className="text-[9px] text-red-500/70">{responseMsg}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailTester;

import React, { useState } from 'react';
import { Mail, Check, AlertTriangle, Send } from 'lucide-react';

const EmailTester = ({ adminUser }) => {
    const [testEmail, setTestEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [responseMsg, setResponseMsg] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('welcome_new'); // welcome_new, extension, standard, black_test

    const handleTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmail) return;

        setStatus('loading');
        setResponseMsg('');

        try {
            // Fetch HTML template
            let templatePath = '/testemail.html';
            if (selectedTemplate === 'black_test') templatePath = '/testblack.html';
            if (selectedTemplate === 'welcome_new') templatePath = '/welcome-email.html';
            if (selectedTemplate === 'extension') templatePath = '/extension-email.html';

            const responseHtml = await fetch(templatePath);
            if (!responseHtml.ok) throw new Error(`No se pudo cargar ${templatePath}`);
            let htmlContent = await responseHtml.text();

            // Populate mock data
            htmlContent = htmlContent.replace(/{{USER_NAME}}/g, "Tester Admin");
            htmlContent = htmlContent.replace(/{{PLAN_NAME}}/g, "PLAN DE PRUEBA VIP");
            htmlContent = htmlContent.replace(/{{PLAN_PRICE}}/g, "25.00");
            htmlContent = htmlContent.replace(/{{USER_EMAIL}}/g, testEmail);
            htmlContent = htmlContent.replace(/{{USER_PASSWORD}}/g, "PasswordSegura123!");
            htmlContent = htmlContent.replace(/{{DAYS_ADDED}}/g, "7");
            htmlContent = htmlContent.replace(/{{NEW_EXPIRY}}/g, "26 DE MARZO, 2026");

            // Send via API endpoint
            let apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
            if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
                apiUrl = '/api/auth/send-welcome-email';
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    name: "Tester Admin",
                    htmlContent: htmlContent
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                setResponseMsg('¡Correo enviado con éxito a ' + testEmail + '!');
            } else {
                throw new Error(data.error || 'Error desconocido al enviar el email');
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

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-red-600 text-white font-black italic text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR CORREO DE PRUEBA'} <Send size={16} />
                </button>
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

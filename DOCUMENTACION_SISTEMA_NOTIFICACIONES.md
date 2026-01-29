# 🔔 Sistema de Notificaciones Push - Documentación Completa

## 📋 Descripción General

Este proyecto implementa un sistema completo de notificaciones push usando **OneSignal** como proveedor de notificaciones. El sistema permite:

- ✅ Notificaciones broadcast (a todos los usuarios)
- ✅ Notificaciones dirigidas (por email)
- ✅ Auto-etiquetado de usuarios al iniciar sesión
- ✅ Títulos y mensajes personalizados
- ✅ Logs de depuración completos

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│                 │
│ 1. Usuario      │
│    inicia       │
│    sesión       │
│                 │
│ 2. Email →      │
│    localStorage │
│                 │
│ 3. OneSignal    │
│    detecta      │
│    email        │
│                 │
│ 4. Usuario se   │
│    etiqueta     │
└────────┬────────┘
         │
         │ HTTP POST
         │
         ▼
┌─────────────────┐
│   API Backend   │
│   (Vercel)      │
│                 │
│ /api/broadcast  │
│                 │
│ - Recibe título │
│ - Recibe body   │
│ - Recibe data   │
│ - Recibe email  │
│   (opcional)    │
└────────┬────────┘
         │
         │ OneSignal API
         │
         ▼
┌─────────────────┐
│   OneSignal     │
│   Service       │
│                 │
│ - Filtra por    │
│   segmentos     │
│ - Filtra por    │
│   tags (email)  │
│ - Envía push    │
└────────┬────────┘
         │
         │ Push Notification
         │
         ▼
┌─────────────────┐
│   Usuarios      │
│   Suscritos     │
└─────────────────┘
```

---

## 🔧 Componentes del Sistema

### 1. **OneSignal SDK (Frontend)**
**Archivo:** `index.html`

```html
<!-- OneSignal SDK (Official Setup) -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
      appId: "TU_ONESIGNAL_APP_ID",
      safari_web_id: "TU_SAFARI_WEB_ID",
      notifyButton: {
        enable: true
      },
      allowLocalhostAsSecureOrigin: true
    });

    // Auto-tag users when they login
    let lastTaggedEmail = null;

    const checkAndTagUser = async () => {
      const userEmail = localStorage.getItem('dn_academy_email');
      
      if (userEmail && userEmail !== lastTaggedEmail) {
        console.log('🏷️ [OneSignal] Tagging user with email:', userEmail);
        try {
          await OneSignal.User.addTag('email', userEmail);
          lastTaggedEmail = userEmail;
          console.log('✅ [OneSignal] User tagged successfully');
        } catch (err) {
          console.error('❌ [OneSignal] Failed to tag user:', err);
        }
      }
    };

    // Check immediately
    checkAndTagUser();

    // Check when storage changes
    window.addEventListener('storage', checkAndTagUser);

    // Check continuously every 5 seconds
    setInterval(() => {
      checkAndTagUser();
    }, 5000);

    console.log('🔔 [OneSignal] Continuous email monitoring active');
  });
</script>
```

**Configuración:**
- Reemplaza `TU_ONESIGNAL_APP_ID` con tu App ID de OneSignal
- Reemplaza `TU_SAFARI_WEB_ID` con tu Safari Web ID
- Ajusta el nombre de la clave de localStorage (`dn_academy_email`) según tu proyecto

---

### 2. **Service Worker (OneSignal)**
**Archivo:** `public/OneSignalSDKWorker.js`

```javascript
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');
```

**Nota:** Este archivo debe estar en la carpeta `public` para que sea accesible desde la raíz del dominio.

---

### 3. **Guardar Email en Login**
**Archivo:** `src/App.jsx` (o donde manejes el login)

```javascript
const handleLogin = async (firebaseUser) => {
  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    // ... otros datos
  };

  // Guardar usuario en localStorage
  localStorage.setItem('user', JSON.stringify(userData));
  
  // ⭐ IMPORTANTE: Guardar email separado para OneSignal
  localStorage.setItem('dn_academy_email', userData.email);
  console.log('💾 [Login] Email saved to localStorage:', userData.email);
  
  // Disparar evento de storage para OneSignal
  window.dispatchEvent(new Event('storage'));
  
  setUser(userData);
};
```

---

### 4. **Función de Broadcast (Frontend)**
**Archivo:** `src/App.jsx`

```javascript
const broadcastSignal = async (signalObj) => {
  if (!signalObj) return;
  
  try {
    const payload = typeof signalObj === 'string'
      ? { message: signalObj, timestamp: serverTimestamp(), sender: user.email }
      : { ...signalObj, timestamp: serverTimestamp(), sender: user.email };

    // 1. Guardar en Firestore (opcional)
    if (!signalObj.skipSave) {
      if (signalObj.id) {
        await setDoc(doc(db, "signals", signalObj.id), payload, { merge: true });
      } else {
        await addDoc(collection(db, "signals"), payload);
      }
    }

    // 2. Preparar notificación
    const notifyBody = typeof signalObj === 'string'
      ? signalObj
      : `${signalObj.message}${signalObj.entry && signalObj.entry !== '---' ? ` [PE: ${signalObj.entry}]` : ''}`;

    // ⭐ Usar título personalizado si se proporciona
    const notifyTitle = typeof signalObj === 'object' && signalObj.title 
      ? signalObj.title 
      : "App Name - SIGNAL";

    // 3. Obtener token de autenticación
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    if (!idToken) {
      console.error("No authenticated user found for broadcast.");
      return;
    }

    // 4. Llamar a la API de broadcast
    const TARGET_API_URL = 'https://tu-api.vercel.app/api/broadcast';
    console.log("📡 [Broadcast] Targeting API:", TARGET_API_URL);
    console.log("📡 [Broadcast] Title:", notifyTitle);

    const response = await fetch(TARGET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        title: notifyTitle,
        body: notifyBody,
        data: payload,
        targetEmail: signalObj.targetEmail // Opcional: para notificaciones dirigidas
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let errData = {};
      try {
        errData = JSON.parse(text);
      } catch (e) {
        console.error("Critical: API returned non-JSON response");
        throw new Error(`Critical: Backend returned HTML instead of JSON`);
      }
      console.error("Broadcast API Failed:", response.status, errData);
      throw new Error(errData.details || errData.error || `Error ${response.status}`);
    }

    console.log("✅ [Broadcast] Notification sent successfully");
  } catch (e) {
    console.error("Error broadcasting: ", e);
    throw e;
  }
};
```

---

### 5. **API Backend (Vercel)**
**Archivo:** `api/broadcast.js`

```javascript
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const bodyPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { title, body, data, targetEmail } = bodyPayload || {};

    console.log(`📡 OneSignal Broadcast: ${title} - ${body}`);

    // Construct OneSignal Payload
    const payload = {
      app_id: "TU_ONESIGNAL_APP_ID",
      contents: { en: body || "New Alert" },
      headings: { en: title || "App Name" },
      data: data || {},
      url: "https://tu-app.com/",
      android_group: "app_notifications",
      ios_badgeType: "Increase",
      ios_badgeCount: 1
    };

    // ⭐ Targeting Logic
    if (targetEmail) {
      // Target specific user by Email Tag
      payload.filters = [
        { field: "tag", key: "email", relation: "=", value: targetEmail }
      ];
      console.log(`🎯 Targeting specific user: ${targetEmail}`);
    } else {
      // Broadcast to All
      payload.included_segments = ["All"];
      console.log(`🎯 Targeting ALL users`);
    }

    // Send to OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic TU_ONESIGNAL_REST_API_KEY'
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    console.log("📦 OneSignal Payload Sent:", JSON.stringify(payload, null, 2));
    console.log("✅ OneSignal Response Status:", response.status);
    console.log("✅ OneSignal Response:", JSON.stringify(json, null, 2));

    // Check for errors
    if (json.errors && json.errors.length > 0) {
      console.error("❌ OneSignal Errors:", json.errors);
    }

    // Check recipients
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
```

**Configuración:**
- Reemplaza `TU_ONESIGNAL_APP_ID` con tu App ID
- Reemplaza `TU_ONESIGNAL_REST_API_KEY` con tu REST API Key de OneSignal
- Ajusta la URL de tu app

---

### 6. **Ejemplo de Uso en Componentes**

#### **Enviar Notificación Simple**
```javascript
await broadcastSignal("🚀 Nueva señal disponible!");
```

#### **Enviar Notificación con Título Personalizado**
```javascript
await broadcastSignal({
  title: "✅ TAKE PROFIT ALCANZADO",
  message: "💰 BOOM 1000 - TP TOCADO @ 12465.0",
  pair: "BOOM 1000",
  type: "WIN",
  skipSave: true // No guardar en Firestore
});
```

#### **Enviar Notificación Dirigida**
```javascript
await broadcastSignal({
  title: "🎓 NEW LESSON",
  message: "New content available in Module 1",
  targetEmail: "user@example.com" // Solo este usuario recibirá la notificación
});
```

#### **Enviar Anuncio**
```javascript
const createAnnouncement = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Guardar en Firestore
    await addDoc(collection(db, "announcements"), {
      title: annForm.title.toUpperCase(),
      message: annForm.message,
      timestamp: serverTimestamp(),
      sender: user.email
    });

    // 2. Enviar notificación push
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    console.log("📡 [Announcement] Sending notification...");
    
    const notificationResponse = await fetch('https://tu-api.vercel.app/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "📢 NEW ANNOUNCEMENT",
        body: annForm.title.toUpperCase(),
        data: { type: 'ANNOUNCEMENT' }
      })
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error("❌ [Announcement] Notification failed:", errorText);
      throw new Error(`Notification failed: ${errorText}`);
    }

    const notificationResult = await notificationResponse.json();
    console.log("✅ [Announcement] Notification sent:", notificationResult);

    alert("ANNOUNCEMENT DEPLOYED TO NETWORK");
  } catch (e) {
    console.error("❌ [Announcement] Error:", e);
    alert("DEPLOYMENT FAILED: " + e.message);
  }
};
```

---

## 🔑 Configuración de OneSignal

### 1. **Crear Cuenta en OneSignal**
1. Ve a [https://onesignal.com/](https://onesignal.com/)
2. Crea una cuenta gratuita
3. Crea una nueva app (Web Push)

### 2. **Obtener Credenciales**

Necesitarás:
- **App ID**: En Settings → Keys & IDs
- **REST API Key**: En Settings → Keys & IDs
- **Safari Web ID**: En Settings → Platforms → Safari (si usas Safari)

### 3. **Configurar Dominio**

1. Ve a Settings → Platforms → Web Push
2. Agrega tu dominio (ej: `https://tu-app.com`)
3. Para desarrollo local, habilita `allowLocalhostAsSecureOrigin: true`

### 4. **Configurar Service Worker**

OneSignal requiere que el service worker esté en la raíz del dominio:
- Coloca `OneSignalSDKWorker.js` en la carpeta `public`
- Verifica que sea accesible en `https://tu-app.com/OneSignalSDKWorker.js`

---

## 📦 Dependencias Necesarias

### **Frontend (React/Vite)**
```json
{
  "dependencies": {
    "firebase": "^10.x.x",
    "react": "^18.x.x"
  }
}
```

### **Backend (Vercel)**
No requiere dependencias adicionales, usa `fetch` nativo de Node.js.

---

## 🚀 Despliegue

### **Frontend (Cloudflare Pages / Vercel / Netlify)**
```bash
npm run build
npx wrangler pages deploy dist --project-name tu-proyecto
```

### **Backend (Vercel)**
```bash
vercel deploy
```

**Estructura de archivos:**
```
/
├── api/
│   └── broadcast.js
├── public/
│   └── OneSignalSDKWorker.js
├── src/
│   ├── App.jsx
│   └── components/
├── index.html
└── vercel.json (opcional)
```

---

## 🧪 Testing

### **1. Verificar Etiquetado de Usuario**
```javascript
// En la consola del navegador después de login:
localStorage.getItem('dn_academy_email')
// Debería retornar: "tu-email@ejemplo.com"
```

### **2. Verificar OneSignal Dashboard**
1. Ve a OneSignal Dashboard → Audience → All Users
2. Busca tu usuario
3. Verifica que tenga el tag: `email = tu-email@ejemplo.com`

### **3. Enviar Notificación de Prueba**
```javascript
// Desde la consola del navegador:
await fetch('https://tu-api.vercel.app/api/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TU_TOKEN'
  },
  body: JSON.stringify({
    title: "Test Notification",
    body: "This is a test",
    data: { type: 'TEST' }
  })
}).then(r => r.json()).then(console.log);
```

---

## 🐛 Troubleshooting

### **Problema: No se reciben notificaciones**

**Verificar:**
1. ✅ Usuario aceptó permisos de notificaciones
2. ✅ Email guardado en localStorage
3. ✅ Usuario etiquetado en OneSignal
4. ✅ API responde correctamente
5. ✅ Logs de Vercel muestran `recipients > 0`

**Solución:**
```javascript
// Verificar en consola:
console.log('Email:', localStorage.getItem('dn_academy_email'));
console.log('Permissions:', Notification.permission);
```

### **Problema: Recipients = 0**

**Causa:** No hay usuarios suscritos o el filtro no coincide

**Solución:**
1. Verifica que el tag `email` esté correcto en OneSignal
2. Usa `included_segments: ["All"]` para broadcast
3. Verifica que los usuarios hayan aceptado notificaciones

### **Problema: OneSignal no se carga**

**Causa:** Service Worker no accesible

**Solución:**
1. Verifica que `OneSignalSDKWorker.js` esté en `public/`
2. Verifica que sea accesible en `/OneSignalSDKWorker.js`
3. Limpia caché del navegador

---

## 📊 Logs de Depuración

El sistema incluye logs detallados en cada paso:

```
💾 [Login] Email saved to localStorage: user@example.com
🏷️ [OneSignal] Tagging user with email: user@example.com
✅ [OneSignal] User tagged successfully
🔔 [OneSignal] Continuous email monitoring active
📡 [Broadcast] Targeting API: https://...
📡 [Broadcast] Title: ✅ TAKE PROFIT ALCANZADO
✅ [Broadcast] Notification sent successfully
📦 OneSignal Payload Sent: {...}
✅ OneSignal Response Status: 200
📊 Recipients: 5
```

---

## 🎯 Mejores Prácticas

1. **Siempre usa títulos descriptivos** para que los usuarios sepan de qué se trata
2. **Incluye datos relevantes** en el payload para tracking
3. **Verifica recipients** en los logs para asegurar que llegaron
4. **Usa targetEmail** para notificaciones importantes a usuarios específicos
5. **Implementa rate limiting** para evitar spam de notificaciones
6. **Prueba en múltiples navegadores** (Chrome, Safari, Firefox)
7. **Maneja errores gracefully** con try/catch y logs

---

## 📝 Checklist de Implementación

- [ ] Crear cuenta en OneSignal
- [ ] Obtener App ID y REST API Key
- [ ] Configurar dominio en OneSignal
- [ ] Agregar SDK de OneSignal en `index.html`
- [ ] Crear `OneSignalSDKWorker.js` en `public/`
- [ ] Implementar guardado de email en login
- [ ] Crear función `broadcastSignal` en frontend
- [ ] Crear endpoint `/api/broadcast` en backend
- [ ] Agregar logs de depuración
- [ ] Probar notificaciones broadcast
- [ ] Probar notificaciones dirigidas
- [ ] Verificar etiquetado en OneSignal Dashboard
- [ ] Desplegar a producción
- [ ] Probar en producción

---

## 🔗 Referencias

- [OneSignal Web Push Documentation](https://documentation.onesignal.com/docs/web-push-quickstart)
- [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)
- [Web Push Protocol](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

## 💡 Prompt para IA

Si quieres que una IA implemente este sistema en otro proyecto, usa este prompt:

```
Implementa un sistema completo de notificaciones push usando OneSignal con las siguientes características:

1. **Frontend (React/Vite)**:
   - Inicializar OneSignal SDK en index.html con auto-etiquetado de usuarios
   - Guardar email del usuario en localStorage al iniciar sesión
   - Verificar continuamente cada 5 segundos si hay un email en localStorage
   - Etiquetar usuario en OneSignal con su email automáticamente
   - Crear función broadcastSignal que permita enviar notificaciones con títulos personalizados
   - Agregar logs de depuración con emojis en cada paso

2. **Backend (Vercel/Node.js)**:
   - Crear endpoint /api/broadcast que reciba: title, body, data, targetEmail
   - Implementar lógica de targeting: broadcast a todos o dirigido por email
   - Enviar notificación a OneSignal REST API
   - Agregar logs detallados del payload enviado y respuesta recibida
   - Verificar número de recipients y mostrar advertencia si es 0

3. **Configuración**:
   - Service Worker en public/OneSignalSDKWorker.js
   - CORS habilitado en la API
   - Soporte para localhost en desarrollo
   - Manejo de errores robusto con try/catch

4. **Características**:
   - Notificaciones broadcast (a todos)
   - Notificaciones dirigidas (por email)
   - Títulos personalizados
   - Datos adicionales en payload
   - Evitar llamadas redundantes al etiquetar

Usa el código de referencia del proyecto IngenusFX como base.
```

---

**Última actualización:** 2026-01-20
**Versión del sistema:** 1.0
**OneSignal SDK:** v16

# 🔔 Guía de Prueba de Notificaciones

## Cambios Implementados

Se han corregido los siguientes problemas con las notificaciones:

### ✅ Problemas Resueltos

1. **Notificaciones de SL/TP** - Ahora usan títulos personalizados
2. **Notificaciones de Anuncios** - Mejor manejo de errores y logs
3. **Etiquetado de Usuarios** - Auto-etiquetado con email en OneSignal
4. **Logs de Depuración** - Logs detallados en toda la cadena

---

## 🧪 Cómo Probar las Notificaciones

### 1️⃣ **Preparación**

1. Abre la aplicación en tu navegador
2. Abre la **Consola de Desarrollador** (F12)
3. Ve a la pestaña **Console**
4. Inicia sesión con tu cuenta de admin

### 2️⃣ **Verificar Etiquetado de Usuario**

Después de iniciar sesión, deberías ver en la consola:

```
💾 [Login] Email saved to localStorage: tu-email@ejemplo.com
🏷️ [OneSignal] Tagging user with email: tu-email@ejemplo.com
✅ [OneSignal] User tagged successfully
```

**Si ves estos logs:** ✅ El usuario está correctamente etiquetado

**Si NO ves estos logs:** ❌ Hay un problema con OneSignal

---

### 3️⃣ **Probar Notificación de Entrada (Nueva Señal)**

1. Ve al panel de **Admin** → **SIGNAL OPS**
2. Crea una nueva señal con los datos que quieras
3. Haz clic en **BROADCAST SIGNAL**

**Logs esperados en la consola:**

```
📡 [Broadcast] Targeting API: https://ingenus-fx.vercel.app/api/broadcast
📡 [Broadcast] Title: IndexGeniusGOLD - SIGNAL
```

**Resultado esperado:** 
- ✅ Deberías recibir una notificación push con el título "IndexGeniusGOLD - SIGNAL"

---

### 4️⃣ **Probar Notificación de SL/TP**

1. Ve al **Dashboard** donde están las señales activas
2. Encuentra una señal con estado **ACTIVE**
3. Haz clic en **TP TOCADO (GANANCIAS)** o **SL TOCADO (SALGAN)**

**Logs esperados en la consola:**

```
📡 [Broadcast] Targeting API: https://ingenus-fx.vercel.app/api/broadcast
📡 [Broadcast] Title: ✅ TAKE PROFIT ALCANZADO
```
o
```
📡 [Broadcast] Title: ⚠️ STOP LOSS TOCADO
```

**Resultado esperado:**
- ✅ Deberías recibir una notificación push con el título personalizado (TP o SL)

---

### 5️⃣ **Probar Notificación de Anuncio**

1. Ve al panel de **Admin** → **INTEL DEPLOY**
2. Escribe un título y mensaje
3. Haz clic en **AUTHORIZE BROADCAST**

**Logs esperados en la consola:**

```
📡 [Announcement] Sending notification...
📡 [Announcement] Title: 📢 NEW ANNOUNCEMENT
📡 [Announcement] Body: TU TITULO AQUI
✅ [Announcement] Notification sent: { success: true, os_response: {...} }
```

**Resultado esperado:**
- ✅ Deberías recibir una notificación push con el título "📢 NEW ANNOUNCEMENT"
- ✅ Deberías ver la alerta "ANNOUNCEMENT DEPLOYED TO NETWORK"

---

### 6️⃣ **Probar Push Console**

1. Ve al panel de **Admin** → **PUSH CONSOLE**
2. Escribe un título y mensaje personalizado
3. Haz clic en **SEND PUSH**

**Logs esperados en la consola:**

```
📡 [Push Console] Sending notification...
📡 [Push Console] Title: Tu Título
📡 [Push Console] Body: Tu Mensaje
✅ [Push Console] Notification sent: { success: true, os_response: {...} }
```

**Resultado esperado:**
- ✅ Deberías recibir una notificación push con tu título personalizado
- ✅ Deberías ver la alerta "PUSH NOTIFICATION SENT SUCCESSFULLY"

---

## 🔍 Diagnóstico de Problemas

### ❌ Si NO recibes notificaciones:

#### **Verifica en la Consola del Navegador:**

1. **¿Hay errores de OneSignal?**
   ```
   ❌ [OneSignal] Failed to tag user: ...
   ```
   → Problema con la configuración de OneSignal

2. **¿La API responde correctamente?**
   ```
   ❌ [Announcement] Notification failed: ...
   ```
   → Problema con la API de broadcast

3. **¿El número de destinatarios es 0?**
   → Ve a los logs de Vercel (ver siguiente sección)

---

### 📊 Verificar Logs de Vercel (API)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **ingenus-fx**
3. Ve a **Logs** en el menú lateral
4. Busca los logs de `/api/broadcast`

**Logs esperados:**

```
📡 OneSignal Broadcast: ✅ TAKE PROFIT ALCANZADO - ...
🎯 Targeting ALL users
📦 OneSignal Payload Sent: { ... }
✅ OneSignal Response Status: 200
✅ OneSignal Response: { ... }
📊 Recipients: 5  ← Número de usuarios que recibieron la notificación
```

**Si `Recipients: 0`:**
- ⚠️ **Problema:** No hay usuarios suscritos a OneSignal
- **Solución:** Verifica que los usuarios hayan aceptado las notificaciones push

---

### 🔔 Verificar Suscripción a OneSignal

1. Ve a [OneSignal Dashboard](https://dashboard.onesignal.com/)
2. Selecciona tu app **IndexGeniusGOLD**
3. Ve a **Audience** → **All Users**
4. Busca tu email en los tags

**Deberías ver:**
- ✅ Tag: `email = tu-email@ejemplo.com`

**Si NO ves el tag:**
- ❌ El usuario no se etiquetó correctamente
- Revisa los logs de la consola del navegador

---

## 🎯 Checklist de Verificación

- [ ] Usuario se loguea y ve logs de etiquetado en consola
- [ ] Notificación de entrada (nueva señal) funciona
- [ ] Notificación de TP funciona con título personalizado
- [ ] Notificación de SL funciona con título personalizado
- [ ] Notificación de anuncio funciona
- [ ] Push Console funciona
- [ ] Logs de Vercel muestran `Recipients > 0`
- [ ] OneSignal Dashboard muestra el tag de email

---

## 📝 Notas Importantes

1. **Permisos de Notificaciones**: Los usuarios deben aceptar las notificaciones push en su navegador
2. **Etiquetado**: El etiquetado es automático al iniciar sesión
3. **Logs**: Todos los logs están prefijados con emojis para fácil identificación
4. **Errores**: Cualquier error se mostrará en la consola con el prefijo ❌

---

## 🆘 Si Nada Funciona

1. **Cierra sesión y vuelve a iniciar sesión**
2. **Limpia el localStorage del navegador**
3. **Acepta las notificaciones push cuando se solicite**
4. **Verifica que no tengas bloqueadores de anuncios activos**
5. **Revisa los logs de Vercel para ver si hay errores del lado del servidor**

---

## 📞 Soporte

Si después de seguir todos los pasos las notificaciones siguen sin funcionar:

1. Copia todos los logs de la consola del navegador
2. Copia los logs de Vercel
3. Verifica el estado de OneSignal Dashboard
4. Comparte esta información para diagnóstico adicional

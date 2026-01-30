# 🔐 Guía de Seguridad - IndexGenius FX

## 📋 Configuración Inicial

### 1. Variables de Entorno

Este proyecto usa variables de entorno para proteger credenciales sensibles.

#### Configuración para Desarrollo Local:

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. El archivo `.env` ya contiene las credenciales correctas. **NUNCA** lo subas a Git.

3. Si necesitas cambiar alguna credencial, edita el archivo `.env` localmente.

#### Variables Disponibles:

- `VITE_FIREBASE_API_KEY` - API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` - Dominio de autenticación
- `VITE_FIREBASE_PROJECT_ID` - ID del proyecto
- `VITE_FIREBASE_STORAGE_BUCKET` - Bucket de almacenamiento
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - ID del remitente de mensajes
- `VITE_FIREBASE_APP_ID` - ID de la aplicación
- `VITE_FIREBASE_MEASUREMENT_ID` - ID de medición (Analytics)
- `VITE_API_URL` - URL del backend API

### 2. Despliegue en Producción

#### Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega todas las variables del archivo `.env.example`
4. Redeploy el proyecto

#### Netlify:
1. Site settings → Build & deploy → Environment
2. Agrega las variables una por una
3. Redeploy

## 🛡️ Reglas de Seguridad

### Firestore Security Rules

Las reglas están en `firestore.rules` y protegen:
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Sistema de roles (admin, user, approved)
- ✅ Usuarios solo ven sus propios datos
- ✅ Admins tienen acceso completo
- ✅ Contenido premium solo para usuarios aprobados

### Storage Security Rules

Las reglas están en `storage.rules` y protegen:
- ✅ Avatares: solo el propietario puede modificar
- ✅ Assets de academia: solo lectura
- ✅ Denegación por defecto para rutas no especificadas

## 🔒 Mejores Prácticas

### Para Desarrolladores:

1. **NUNCA** hagas commit del archivo `.env`
2. **NUNCA** expongas credenciales en el código
3. **SIEMPRE** usa `import.meta.env.VITE_*` para acceder a variables
4. **SIEMPRE** valida inputs de usuario
5. **SIEMPRE** usa las reglas de Firestore para proteger datos

### Para Administradores:

1. Rota las credenciales periódicamente
2. Monitorea el uso de Firebase Console
3. Revisa logs de seguridad regularmente
4. Mantén las dependencias actualizadas
5. Realiza auditorías de seguridad trimestrales

## 🚨 En Caso de Compromiso de Credenciales

Si las credenciales se exponen:

1. **Inmediatamente**:
   - Regenera las API Keys en Firebase Console
   - Actualiza las variables de entorno en todos los entornos
   - Revisa los logs de Firebase para actividad sospechosa

2. **Dentro de 24 horas**:
   - Notifica a todos los usuarios si hay riesgo de datos
   - Cambia todas las credenciales relacionadas
   - Implementa monitoreo adicional

3. **Seguimiento**:
   - Documenta el incidente
   - Implementa medidas preventivas adicionales
   - Actualiza este documento con lecciones aprendidas

## 📊 Checklist de Seguridad

Antes de cada deploy a producción:

- [ ] Todas las variables de entorno están configuradas
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Las reglas de Firestore están actualizadas
- [ ] Las reglas de Storage están actualizadas
- [ ] Las dependencias están actualizadas (`npm audit`)
- [ ] El código ha sido revisado por otro desarrollador
- [ ] Se han ejecutado las pruebas de seguridad

## 🔗 Recursos Adicionales

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 📞 Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor contacta:
- Email: steven@ingenius.fx
- No publiques vulnerabilidades públicamente hasta que sean resueltas

---

**Última actualización**: 2026-01-30  
**Próxima revisión**: 2026-04-30

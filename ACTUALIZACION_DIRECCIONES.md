# 🔄 Actualización de Direcciones de Pago

## 📋 Nuevas Direcciones

Las siguientes direcciones deben reemplazar a las antiguas:

- **USDT TRC20**: `TASF23cMtiw9Cxt9UkP8puy9Fsp5PdfwA9`
- **USDT BEP20**: `0x5cbf47ac13c96d4d2c38b447e51514d08f0d83a7`
- **BINANCE ID**: `1132867046` (Usuario: eltevenfx1)

---

## 🎯 Métodos de Actualización

Tienes **3 opciones** para actualizar las direcciones. Elige la que prefieras:

### ✅ OPCIÓN 1: Componente React (RECOMENDADO)

Esta es la forma más fácil y visual.

1. **Abre** `src/components/Admin.jsx`

2. **Importa** el componente al inicio del archivo:
   ```javascript
   import UpdatePaymentAddresses from './UpdatePaymentAddresses';
   ```

3. **Agrega** el componente en alguna sección visible del panel de administración:
   ```jsx
   <UpdatePaymentAddresses />
   ```

4. **Guarda** el archivo y recarga la aplicación

5. **Inicia sesión** como administrador

6. **Haz clic** en el botón "Actualizar Direcciones de Pago"

7. **Espera** a que se complete el proceso (verás un mensaje de éxito)

8. **Opcional**: Puedes remover el componente después de usarlo

---

### ✅ OPCIÓN 2: Consola del Navegador

Si prefieres no modificar el código:

1. **Abre** la aplicación en tu navegador

2. **Inicia sesión** como administrador

3. **Abre** la consola del navegador (presiona `F12`)

4. **Abre** el archivo `update_payment_console.js`

5. **Copia** todo el contenido del archivo

6. **Pega** el código en la consola del navegador

7. **Presiona** Enter

8. **Verifica** los mensajes en la consola para confirmar la actualización

---

### ✅ OPCIÓN 3: Actualización Manual en Firebase Console

Si prefieres hacerlo manualmente:

1. **Accede** a [Firebase Console](https://console.firebase.google.com/)

2. **Selecciona** tu proyecto: `ingenius-f33a6`

3. **Ve** a Firestore Database

4. **Busca** la colección `payment_methods`

5. **Elimina** todos los documentos con `category: "CRIPTO"`

6. **Agrega** los siguientes documentos nuevos:

   **Documento 1:**
   ```
   name: "USDT TRC20"
   value: "TASF23cMtiw9Cxt9UkP8puy9Fsp5PdfwA9"
   category: "CRIPTO"
   icon: "usdt"
   owner: "STEVEN CASTILLO"
   ```

   **Documento 2:**
   ```
   name: "USDT BEP20"
   value: "0x5cbf47ac13c96d4d2c38b447e51514d08f0d83a7"
   category: "CRIPTO"
   icon: "usdt"
   owner: "STEVEN CASTILLO"
   ```

   **Documento 3:**
   ```
   name: "BINANCE ID"
   value: "1132867046"
   category: "CRIPTO"
   icon: "binance"
   owner: "eltevenfx1"
   ```

---

## ✅ Verificación

Después de actualizar, verifica que las nuevas direcciones aparezcan correctamente:

1. **Abre** la aplicación
2. **Ve** al portal de pagos
3. **Selecciona** "PAGAR CON CRIPTOS"
4. **Verifica** que aparezcan las 3 nuevas direcciones

---

## 📁 Archivos Creados

- `update_payment_addresses.js` - Script Node.js (requiere permisos de admin)
- `update_payment_console.js` - Script para consola del navegador
- `src/components/UpdatePaymentAddresses.jsx` - Componente React
- `ACTUALIZACION_DIRECCIONES.md` - Este documento

---

## ⚠️ Notas Importantes

- Las direcciones antiguas serán **eliminadas permanentemente**
- Solo se actualizan las direcciones de **CRIPTO**
- Los métodos de pago de **BANCO** y **APP** no se modifican
- Asegúrate de tener permisos de administrador antes de ejecutar

---

## 🆘 Soporte

Si tienes algún problema durante la actualización:

1. Verifica que estés autenticado como administrador
2. Revisa la consola del navegador para ver errores
3. Asegúrate de tener conexión a internet
4. Verifica que Firebase esté configurado correctamente

---

*Última actualización: 17 de enero de 2026*

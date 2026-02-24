import { onRequestOptions as __api_auth_send_welcome_email_js_onRequestOptions } from "E:\\ingenusfx\\functions\\api\\auth\\send-welcome-email.js"
import { onRequestPost as __api_auth_send_welcome_email_js_onRequestPost } from "E:\\ingenusfx\\functions\\api\\auth\\send-welcome-email.js"
import { onRequestOptions as __api_broadcast_js_onRequestOptions } from "E:\\ingenusfx\\functions\\api\\broadcast.js"
import { onRequestPost as __api_broadcast_js_onRequestPost } from "E:\\ingenusfx\\functions\\api\\broadcast.js"

export const routes = [
    {
      routePath: "/api/auth/send-welcome-email",
      mountPath: "/api/auth",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_auth_send_welcome_email_js_onRequestOptions],
    },
  {
      routePath: "/api/auth/send-welcome-email",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_send_welcome_email_js_onRequestPost],
    },
  {
      routePath: "/api/broadcast",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_broadcast_js_onRequestOptions],
    },
  {
      routePath: "/api/broadcast",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_broadcast_js_onRequestPost],
    },
  ]
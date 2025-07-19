import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  // Obtener el webhook secret desde las variables de entorno
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Por favor agrega CLERK_WEBHOOK_SECRET a las variables de entorno")
  }

  // Obtener los headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // Si no hay headers, error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Headers faltantes", {
      status: 400,
    })
  }

  // Obtener el body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Crear una nueva instancia de Svix con el secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verificar el payload con los headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verificando webhook:", err)
    return new Response("Error: Verificación falló", {
      status: 400,
    })
  }

  // Manejar el evento
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook con ID: ${id} y tipo: ${eventType}`)
  console.log("Datos del webhook:", body)

  // Aquí puedes manejar diferentes tipos de eventos
  switch (eventType) {
    case "user.created":
      // Usuario creado - puedes guardar en tu base de datos
      console.log("Nuevo usuario creado:", evt.data)
      break

    case "user.updated":
      // Usuario actualizado
      console.log("Usuario actualizado:", evt.data)
      break

    case "user.deleted":
      // Usuario eliminado
      console.log("Usuario eliminado:", evt.data)
      break

    default:
      console.log(`Evento no manejado: ${eventType}`)
  }

  return new Response("", { status: 200 })
}

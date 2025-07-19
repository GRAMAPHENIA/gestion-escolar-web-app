# Configuración de Clerk para Autenticación

## 📋 Pasos para configurar Clerk

### 1. Crear cuenta en Clerk
1. Ve a [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Crea una cuenta o inicia sesión
3. Crea una nueva aplicación

### 2. Obtener las claves de API
1. En el dashboard de Clerk, ve a **API Keys**
2. Copia las siguientes claves:
   - `Publishable Key` (comienza con `pk_test_` o `pk_live_`)
   - `Secret Key` (comienza con `sk_test_` o `sk_live_`)

### 3. Configurar variables de entorno
1. Copia el archivo `.env.example` a `.env.local`
2. Reemplaza los valores de ejemplo con tus claves reales:

\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
CLERK_SECRET_KEY=sk_test_tu_clave_secreta_aqui
\`\`\`

### 4. Configurar proveedores de autenticación

#### Google OAuth (Recomendado)
1. En el dashboard de Clerk, ve a **User & Authentication > Social Connections**
2. Habilita **Google**
3. Configura las credenciales de Google OAuth:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto o selecciona uno existente
   - Habilita la API de Google+
   - Crea credenciales OAuth 2.0
   - Agrega las URLs de redirección de Clerk

#### Email/Password
1. En **User & Authentication > Email, Phone, Username**
2. Habilita **Email address**
3. Configura las opciones de verificación según tus necesidades

### 5. Configurar URLs de redirección
En el dashboard de Clerk, configura las siguientes URLs:

- **Sign-in URL**: `http://localhost:3000/`
- **Sign-up URL**: `http://localhost:3000/registro`
- **After sign-in URL**: `http://localhost:3000/dashboard`
- **After sign-up URL**: `http://localhost:3000/dashboard`

### 6. Personalización de la UI
La aplicación ya incluye estilos personalizados que coinciden con el diseño:
- Color primario: Naranja (#F6A03B)
- Soporte para modo claro/oscuro
- Estilos consistentes con el resto de la aplicación

### 7. Verificar la configuración
1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000`
3. Prueba el login con Google y email
4. Verifica que la redirección al dashboard funcione correctamente

## 🔧 Configuración avanzada

### Webhooks (Opcional)
Para sincronizar datos de usuario con tu base de datos:
1. En Clerk dashboard, ve a **Webhooks**
2. Crea un nuevo webhook endpoint
3. Configura los eventos que quieres escuchar

### Roles y permisos (Opcional)
Para implementar diferentes niveles de acceso:
1. En Clerk dashboard, ve a **Organizations**
2. Configura roles personalizados
3. Implementa la lógica de autorización en tu aplicación

## 🚨 Seguridad

### Variables de entorno
- ✅ **NUNCA** commitees el archivo `.env.local`
- ✅ Usa diferentes claves para desarrollo y producción
- ✅ Mantén las claves secretas seguras

### Producción
Para desplegar en producción:
1. Crea una nueva aplicación en Clerk para producción
2. Configura las URLs de producción
3. Actualiza las variables de entorno en tu plataforma de hosting

## 📞 Soporte
Si tienes problemas con la configuración:
- Revisa la [documentación oficial de Clerk](https://clerk.com/docs)
- Verifica que todas las variables de entorno estén configuradas correctamente
- Asegúrate de que las URLs de redirección coincidan exactamente

# Client Conversations Controller

Un controller en Node.js con TypeScript y Express que obtiene conversaciones de clientes, mensajes y detalles de usuarios con optimización de caché en memoria.

## 🚀 Características

- **Endpoint único**: Obtiene todas las conversaciones y detalles relacionados para un cliente específico
- **Caché inteligente**: Sistema de caché en memoria con TTL para optimizar llamadas a la API
- **TypeScript**: Tipado fuerte para mejor mantenibilidad del código
- **Manejo de errores**: Manejo robusto de errores con logging detallado
- **CORS habilitado**: Configurado para permitir requests desde cualquier origen
- **Endpoints de utilidad**: Estadísticas de caché y limpieza para debugging

## 📋 Flujo de Datos

1. **Recibe request** con `clientId` como parámetro
2. **Busca conversaciones** usando el `clientId` como `contactId`
3. **Obtiene mensajes** para cada conversación encontrada
4. **Obtiene detalles** de cada mensaje individual
5. **Busca información del usuario** si existe `userId` en los detalles del mensaje
6. **Agrega todos los datos** en una respuesta estructurada
7. **Retorna respuesta** completa al cliente

## 🛠️ Instalación

```bash
# Clonar o descargar el proyecto
cd client-conversations-controller

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu token de autenticación
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Requerido: Tu token de autenticación de la API
AUTH_TOKEN=tu-token-aqui

# Opcional: Puerto del servidor (por defecto 3000)
PORT=3000

# Opcional: Entorno de Node
NODE_ENV=development
```

## 🚦 Uso

### Desarrollo

```bash
# Ejecutar en modo desarrollo con hot reload
npm run dev
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar servidor compilado
npm start
```

## 📡 Endpoints

### Endpoint Principal

```http
GET /api/client/:clientId/conversations-details?locationId=optional
```

**Parámetros:**
- `clientId` (requerido): ID del cliente/contacto
- `locationId` (opcional): ID de la ubicación para filtrar conversaciones

**Ejemplo de uso:**
```bash
curl "http://localhost:3000/api/client/cW8PJ6DbLadKiQs0k1fZ/conversations-details?locationId=s6gFxBTDdMZIOvO141T8"
```

**Respuesta exitosa (200):**
```json
{
  "clientId": "cW8PJ6DbLadKiQs0k1fZ",
  "conversations": [
    {
      "conversation": {
        "id": "QKM52JWD8IidYTunv0NP",
        "locationId": "s6gFxBTDdMZIOvO141T8",
        "contactId": "cW8PJ6DbLadKiQs0k1fZ",
        "fullName": "Haywood Tully",
        "phone": "+18314654471",
        // ... más campos de conversación
      },
      "messages": [
        {
          "message": {
            "id": "eDR4TcQMqZwYT0uV748Z",
            "direction": "outbound",
            "messageType": "TYPE_CALL",
            // ... más campos de mensaje
          },
          "messageDetail": {
            "id": "eDR4TcQMqZwYT0uV748Z",
            "userId": "xTn2Pya5C5tPaVvRtZPi",
            "body": "Hi there",
            // ... más detalles del mensaje
          },
          "user": {
            "id": "xTn2Pya5C5tPaVvRtZPi",
            "name": "John Deo",
            "email": "john@deo.com",
            // ... más información del usuario
          }
        }
      ]
    }
  ],
  "totalConversations": 1,
  "fetchedAt": "2024-01-15T10:30:00.000Z"
}
```

### Endpoints de Utilidad

#### Estadísticas de Caché
```http
GET /api/cache/stats
```

#### Limpiar Caché
```http
DELETE /api/cache
```

#### Actualizar Token de Autenticación
```http
PUT /api/auth/token
Content-Type: application/json

{
  "token": "nuevo-token-aqui"
}
```

#### Health Check
```http
GET /health
```

## 🧠 Sistema de Caché

El sistema implementa caché en memoria con diferentes niveles de TTL:

- **Conversaciones**: 5 minutos TTL
- **Mensajes**: 5 minutos TTL  
- **Detalles de mensajes**: 5 minutos TTL
- **Usuarios**: 10 minutos TTL (más tiempo porque cambian menos frecuentemente)

### Beneficios del Caché:

1. **Reducción de llamadas API**: Evita requests repetitivos a la API externa
2. **Mejor rendimiento**: Respuestas más rápidas para datos ya consultados
3. **Optimización de recursos**: Menor uso de ancho de banda y rate limits
4. **Experiencia de usuario**: Tiempos de respuesta más consistentes

### Funcionamiento del Caché:

- **Cache Hit**: Si los datos existen y no han expirado, se retornan inmediatamente
- **Cache Miss**: Si no existen o expiraron, se consulta la API y se almacenan
- **Auto-limpieza**: Los datos expirados se eliminan automáticamente
- **Gestión manual**: Endpoints para ver estadísticas y limpiar caché

## 🏗️ Arquitectura

```
src/
├── types.ts          # Interfaces TypeScript para todas las respuestas de API
├── cache.ts          # Servicio de caché en memoria con TTL
├── apiService.ts     # Servicio para llamadas a APIs externas
├── controller.ts     # Lógica principal del controller con caché
├── routes.ts         # Definición de rutas de Express
├── app.ts           # Configuración de la aplicación Express
└── server.ts        # Punto de entrada del servidor
```

## 🔧 Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **TypeScript**: Superset de JavaScript con tipado estático
- **Express.js**: Framework web para Node.js
- **Axios**: Cliente HTTP para llamadas a APIs
- **CORS**: Middleware para habilitar Cross-Origin Resource Sharing

## 📝 Logging

El sistema incluye logging detallado para:

- Requests entrantes con timestamp e IP
- Cache hits y misses para debugging
- Errores de API con contexto completo
- Estadísticas de procesamiento

## 🚨 Manejo de Errores

- **Validación de parámetros**: Verifica que clientId sea proporcionado
- **Errores de API**: Maneja timeouts, rate limits y respuestas inválidas
- **Errores de red**: Reintentos automáticos y fallbacks
- **Respuestas estructuradas**: Códigos HTTP apropiados y mensajes descriptivos

## 🔒 Seguridad

- **Autenticación**: Token Bearer requerido para todas las llamadas a API
- **CORS configurado**: Permite requests desde cualquier origen (configurable)
- **Validación de entrada**: Sanitización básica de parámetros
- **Rate limiting**: Implementado a nivel de API externa

## 📊 Monitoreo

- **Health check**: Endpoint para verificar estado del servicio
- **Cache stats**: Métricas de uso y eficiencia del caché
- **Logging estructurado**: Para integración con sistemas de monitoreo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC - ver el archivo LICENSE para detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los logs del servidor para errores específicos
2. Verifica que el token de autenticación sea válido
3. Usa el endpoint `/api/cache/stats` para debugging del caché
4. Consulta la documentación de la API externa para cambios

## 🔄 Próximas Mejoras

- [ ] Implementar Redis para caché distribuido
- [ ] Agregar rate limiting propio
- [ ] Implementar paginación para grandes volúmenes de datos
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar webhooks para invalidación de caché
- [ ] Métricas avanzadas con Prometheus
- [ ] Documentación OpenAPI/Swagger


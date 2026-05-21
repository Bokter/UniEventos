# UniEventos 🎓

Plataforma web para centralizar la difusión de eventos universitarios.
Los organizadores publican sus eventos, un administrador los aprueba,
y toda la comunidad puede explorarlos, filtrarlos, ubicarlos en el mapa
del campus y seguirlos en vivo a través de transmisiones externas.

## Stack
### Frontend
- **Framework:** React 18 (con TypeScript & Vite)
- **Estilos:** Tailwind CSS v4, Material UI (MUI), Radix UI y Framer Motion
- **Mapas:** Leaflet / React Leaflet (con integración de mapas del campus de OpenStreetMap)
- **Streaming:** React Player (para reproducir transmisiones en vivo externas de YouTube, Twitch, etc.)
- **Notificaciones/Email:** EmailJS (Envío de correos de confirmación desde el cliente)
- **Despliegue:** Configurado para Vercel (`vercel.json`)
### Backend
- **Framework:** NestJS (Node.js) con TypeScript
- **ORM & DB:** TypeORM con PostgreSQL 16 (ejecutado en contenedor Docker)
- **Seguridad:** Passport.js (Estrategias Local y JWT)
- **Documentación:** Swagger UI (`@nestjs/swagger`)

## Funcionalidades principales
- Registro y autenticación con correo institucional
- Publicación de eventos con flujo de aprobación
- Mapa interactivo del campus
- Filtros por categoría y fecha
- Lista personal de favoritos
- Transmisión en vivo integrada
- Visualización interactiva de eventos en el campus mediante Realidad Aumentada (AR).

---
## Estructura del Proyecto
```text
UniEventos/
├── backend/            # API REST construida con NestJS
│   ├── src/            # Código fuente (Módulos, Controladores, Entidades, etc.)
│   ├── test/           # Pruebas End-to-End (e2e)
│   └── dockerfile      # Dockerfile de producción/desarrollo del Backend
├── frontend/           # Interfaz de usuario construida con React
│   ├── src/            # Componentes, vistas y hooks de React
│   ├── public/         # Recursos estáticos (imágenes, logos y visor AR)
│   └── dockerfile      # Dockerfile de producción/desarrollo del Frontend
├── docker-compose.yml  # Configuración de Docker para levantar todo el stack
├── .env                # Variables de entorno globales
└── README.md           # Documento principal del proyecto
```
---
## Configuración y Ejecución
### Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Docker](https://www.docker.com/) y **Docker Compose** 
---
### Ejecución con Docker 
Docker Compose levantará automáticamente el Frontend, Backend y la Base de Datos PostgreSQL, aplicando las migraciones necesarias.
1. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto basándote en la configuración de base de datos requerida (por defecto viene configurado para Docker):
   ```env
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=unieventos
   JWT_SECRET=tu_secreto_jwt
   
   # Frontend (EmailJS)
   VITE_EMAILJS_SERVICE_ID=tu_service_id
   VITE_EMAILJS_TEMPLATE_ID=tu_template_id
   VITE_EMAILJS_PUBLIC_KEY=tu_public_key
   ```
2. **Levanta la plataforma:**
   Ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   docker compose up --build
   ```
3. **Accede a las aplicaciones:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:3000](http://localhost:3000)
   - **Documentación API (Swagger):** [http://localhost:3000/api](http://localhost:3000/api)
  

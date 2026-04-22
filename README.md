# 🏆 Sistema de Torneos Deportivos

Dashboard para gestionar torneos deportivos locales. Una persona administra el torneo y los participantes pueden ver el estado en tiempo real.

## ✨ Características

- **6 Disciplinas**: Futbol 5, Padel, Loba, Truco, Metegol, Sapo
- **Gestión de Equipos y Jugadores**: Crear, editar y gestionar participantes
- **Resultados en Vivo**: Actualizar scores en tiempo real
- **Clasificaciones Automáticas**: Cálculo de posiciones con criterios de desempate
- **Fixture y Fase Final**: Visualización de partidos y brackets
- **Responsive Design**: Funciona en desktop y mobile

## 🚀 Quick Start

### 1. Clonar y Instalar
```bash
git clone <repo>
cd v0-sports-tournament-dashboard
npm install
```

### 2. Configurar Base de Datos
```bash
# Crear archivo .env.local
echo "DATABASE_URL=postgresql://..." > .env.local

# Sincronizar BD
npm run db:push

# Cargar datos de ejemplo (opcional)
npm run db:seed
```

### 3. Desarrollo Local
```bash
npm run dev
# Abre http://localhost:3000
```

## 📦 Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Deployment**: Vercel

## 🏗️ Estructura

```
app/
├── (disciplinas)     # Páginas públicas de cada deporte
├── api/
│   ├── /tournaments  # API de torneos
│   ├── /disciplines  # API de disciplinas
│   └── /admin        # Panel administrativo
components/          # Componentes reutilizables
lib/                 # Utilidades y cliente Prisma
prisma/              # Schema y migraciones
```

## 📖 Documentación

- [**QUICKSTART.md**](./QUICKSTART.md) - Guía rápida de 5 minutos
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Instrucciones detalladas para Vercel + Neon

## 🔌 API Endpoints

### Públicas
- `GET /api/tournaments` - Listar torneos
- `GET /api/disciplines` - Listar disciplinas
- `GET /api/disciplines/:slug` - Detalle de disciplina
- `GET /api/disciplines/:slug/matches` - Partidos

### Admin
- `PATCH /api/admin/matches/:matchId` - Actualizar resultado
- `POST /api/admin/disciplines/:slug/teams` - Crear equipo
- `POST /api/tournaments` - Crear torneo

## 🔐 Variables de Ambiente

```env
# Base de datos (obtén en neon.tech)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb

# URL pública (para Vercel)
NEXT_PUBLIC_API_URL=https://tu-app.vercel.app
```

## 🛠️ Comandos

```bash
npm run dev              # Desarrollo local
npm run build            # Build para producción
npm run start            # Ejecutar servidor
npm run db:push          # Sincronizar BD
npm run db:seed          # Cargar datos de ejemplo
npm run db:migrate       # Crear nueva migración
npm run prisma:generate  # Generar Prisma Client
```

## 🌐 Deploy

### En Vercel (Recomendado)

1. Push a GitHub
2. Conecta el repo en [vercel.com/new](https://vercel.com/new)
3. Añade `DATABASE_URL` en Environment Variables
4. Deploy automático en cada push a `main`

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para pasos detallados.

## 📝 Licencia

MIT

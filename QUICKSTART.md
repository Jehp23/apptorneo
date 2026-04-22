# 🚀 Quick Start - Deployment en Vercel + Neon

## Checklist Rápido

### 1. **Base de Datos Neon** (5 min)
```bash
# Ve a neon.tech → Crea un proyecto
# Copia tu DATABASE_URL de Neon
# Ej: postgresql://user:pwd@ep-xxx.neon.tech/neondb
```

### 2. **Variables Locales** (2 min)
```bash
# En la raíz del proyecto, crea .env.local
echo "DATABASE_URL=postgresql://..." > .env.local
```

### 3. **Sincronizar BD Localmente** (3 min)
```bash
npm install
npm run db:push
npm run db:seed  # (opcional, carga datos de ejemplo)
```

### 4. **Probar Localmente** (1 min)
```bash
npm run dev
# Abre http://localhost:3000
```

### 5. **Deploy en Vercel** (2 min)
```bash
# Opción A: CLI
vercel

# Opción B: GitHub
# 1. Sube a GitHub
# 2. Ve a vercel.com/new
# 3. Importa repo
# 4. Añade DATABASE_URL en env vars
# 5. Deploy
```

## Estructura de Carpetas

```
├── app/                 # Páginas públicas
├── app/api/            # Rutas backend
│   ├── /tournaments    # API de torneos
│   ├── /disciplines    # API de disciplinas
│   └── /admin          # Panel de administración
├── components/         # Componentes React
├── lib/
│   ├── prisma.ts      # Cliente DB
│   ├── data.ts        # Datos estáticos (legacy)
│   └── utils.ts       # Helpers
├── prisma/
│   ├── schema.prisma  # Esquema de BD
│   └── seed.js        # Datos iniciales
└── public/            # Archivos estáticos
```

## APIs Disponibles

### Públicas (Lectura)
- `GET /api/tournaments` - Todos los torneos
- `GET /api/disciplines` - Todas las disciplinas
- `GET /api/disciplines/[slug]` - Detalle de una disciplina
- `GET /api/disciplines/[slug]/matches` - Partidos de una disciplina

### Admin (Lectura/Escritura)
- `GET /api/admin/disciplines` - Ver todas las disciplinas
- `PATCH /api/admin/matches/[matchId]` - Actualizar resultado
- `POST /api/admin/disciplines/[slug]/teams` - Crear equipo
- `POST /api/tournaments` - Crear torneo

## Ejemplo: Actualizar un Resultado

```javascript
// Desde tu app admin, actualiza un partido:
await fetch('/api/admin/matches/match123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score1: 3,
    score2: 1,
    played: true
  })
})
```

## Variables de Ambiente

| Variable | Dónde | Ejemplo |
|----------|-------|---------|
| `DATABASE_URL` | Neon | `postgresql://user:pwd@ep-xxx.neon.tech/neondb` |
| `NEXT_PUBLIC_API_URL` | Vercel Env | `https://tu-app.vercel.app` |

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor local
npm run build            # Build para producción
npm run db:push          # Sincroniza esquema con BD
npm run db:seed          # Carga datos de ejemplo
npm run db:migrate       # Crea nueva migración

# Vercel
vercel logs              # Ver logs en vivo
vercel env pull          # Obtener vars de ambiente
vercel --prod            # Deploy a producción
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| BD no sincroniza | `npm run db:push` y verifica DATABASE_URL |
| API retorna 404 | Revisa que el `slug` de la disciplina sea correcto |
| Error en Vercel | `vercel logs` y revisa DATABASE_URL |
| Datos no persisten | Ejecuta `npm run db:push` primero |

## Próximos Pasos

1. **Panel Admin** - Crear interfaz para:
   - Crear torneos y disciplinas
   - Cargar equipos y jugadores
   - Actualizar resultados en vivo

2. **Autenticación** - Agregar login para admin

3. **WebSockets** - Actualizaciones en tiempo real

4. **Estadísticas** - Endpoint de stats por jugador/equipo

---

**¿Dudas?** Revisa [DEPLOYMENT.md](./DEPLOYMENT.md) para más detalles.

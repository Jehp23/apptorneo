# Guía de Deploy en Vercel con Neon PostgreSQL

## Paso 1: Configurar Base de Datos Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la cadena de conexión (DATABASE_URL)

## Paso 2: Configurar Vercel

### Opción A: Desde la CLI

```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Opción B: Desde GitHub (recomendado)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa el repositorio
4. Configura las variables de ambiente:
   - `DATABASE_URL`: Tu conexión de Neon

## Paso 3: Configurar Variables de Ambiente

En Vercel, en los settings del proyecto:
- Environment Variables
- Añade `DATABASE_URL` con el valor de tu Neon

## Paso 4: Ejecutar Migraciones (Primera vez)

Una vez deployado, ejecuta en la terminal:

```bash
# Desde tu máquina local, con acceso a Vercel
npm run db:push

# O si estás en Vercel dashboard, usa la función:
vercel env pull  # Para obtener las variables
npm run db:push
```

## Paso 5: Seedear Datos (Opcional)

Si quieres agregar datos de ejemplo:

```bash
npm run db:seed
```

## Estructura del Proyecto

```
v0-sports-tournament-dashboard/
├── app/                    # Páginas Next.js
├── components/             # Componentes React
├── lib/
│   ├── data.ts            # Datos estáticos (será reemplazado por API)
│   ├── prisma.ts          # Cliente Prisma
│   └── utils.ts           # Utilidades
├── prisma/
│   ├── schema.prisma      # Esquema de BD
│   └── seed.js            # Script de seed
├── public/                 # Archivos estáticos
├── .env.example            # Variables de ejemplo
├── .vercelignore           # Archivos a ignorar en Vercel
├── package.json            # Dependencias
├── tsconfig.json           # Config TypeScript
└── vercel.json             # Config Vercel
```

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Ver cambios en BD sin aplicarlos
prisma db push --dry-run

# Generar types de Prisma
npm run prisma:generate

# Build para producción
npm run build

# Ver logs de Vercel
vercel logs

# Obtener variables de ambiente desde Vercel
vercel env pull

# Conectar a BD remota
psql YOUR_DATABASE_URL
```

## Notas de Seguridad

- ✅ Nunca commits `.env.local`
- ✅ Usa `.env.example` para documentar variables necesarias
- ✅ Los secrets en Vercel se encriptan
- ✅ Usa PostgreSQL en producción (no SQLite)

## Troubleshooting

### Error: `Could not find installed "@prisma/client"`
```bash
npm install
npm run prisma:generate
```

### Error: Connection timeout a Neon
- Verifica que la `DATABASE_URL` está correcta
- Revisa que Neon te da acceso desde Vercel (IP whitelist)

### Datos no persisten
- Asegúrate que ejecutaste `npm run db:push` al menos una vez

## Próximos Pasos

1. ✅ Migrar datos desde `lib/data.ts` a BD
2. ✅ Crear endpoints de admin para gestionar el torneo
3. ✅ Agregar autenticación
4. ✅ Crear panel de control para que el admin actualice resultados

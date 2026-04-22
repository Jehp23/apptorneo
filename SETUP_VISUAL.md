# 🔧 Guía Visual: Neon + Vercel

## 1️⃣ Crear Proyecto en NEON

### Paso 1: Ir a neon.tech
```
https://neon.tech/app/projects
```

### Paso 2: Create New Project
Haz click en el botón verde "New Project"

### Paso 3: Configurar
- **Database name**: `neondb` (por defecto)
- **Postgres version**: Latest (recomendado)
- **Region**: Selecciona la más cercana

### Paso 4: Crear Connection String
Una vez creado, irás a:
```
Connection String → Connection Details
```

Copia la URL completa que parece así:
```
postgresql://user:password@ep-xxxx.us-east-1.neon.tech/neondb?sslmode=require
```

⚠️ **IMPORTANTE**: Esta URL es como tu contraseña. Cópiala a `.env.local`

---

## 2️⃣ Setup Local (Antes de Deploy)

### En tu terminal:
```bash
cd /Users/lucianolazarte/fanta/v0-sports-tournament-dashboard

# Crear archivo con la URL de Neon
cat > .env.local << EOF
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.neon.tech/neondb?sslmode=require
EOF

# Instalar dependencias
npm install

# Sincronizar BD con Neon
npm run db:push

# Cargar datos de ejemplo
npm run db:seed

# Probar localmente
npm run dev
```

### Verificar que funciona:
1. Abre http://localhost:3000
2. Deberías ver el torneo con datos
3. API en http://localhost:3000/api/disciplines/futbol-5 debe retornar JSON

---

## 3️⃣ Subir a GitHub

### Si no tienes repo:
```bash
git init
git add .
git commit -m "feat: backend con Prisma y PostgreSQL"
git branch -M main
git remote add origin https://github.com/tu-usuario/torneo-app.git
git push -u origin main
```

### Si ya tienes:
```bash
git add .
git commit -m "feat: backend con Prisma y PostgreSQL"
git push origin main
```

✅ Verifica que está en GitHub: `https://github.com/tu-usuario/torneo-app`

---

## 4️⃣ Deploy en VERCEL

### Paso 1: Ir a Vercel
```
https://vercel.com/new
```

### Paso 2: Importar Repositorio
- Click en "Import Git Repository"
- Selecciona tu repo de GitHub
- Click "Import"

### Paso 3: Configurar Proyecto
- **Project name**: `torneo-app` (o lo que prefieras)
- **Framework**: Next.js (se detecta automáticamente)

### Paso 4: Environment Variables ⚠️ IMPORTANTE
En la sección "Environment Variables":

Haz click en "Add Environment Variable"

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require` |

⚠️ **IMPORTANTE**: Usa la MISMA URL de Neon que en `.env.local`

### Paso 5: Deploy
Click en el botón azul "Deploy"

⏳ Espera 2-3 minutos. Vercel va a:
1. Instalar dependencias (`npm install`)
2. Generar Prisma Client
3. Sincronizar BD (`npm run db:push`)
4. Compilar Next.js

---

## 5️⃣ Verificar Deploy

### En el dashboard de Vercel:
1. Cuando veas "Deployment Complete" → ✅
2. Haz click en la URL (ej: `https://torneo-app.vercel.app`)
3. Debería verse igual que localmente

### Verificar API:
```bash
# En tu navegador abre:
https://torneo-app.vercel.app/api/disciplines/futbol-5

# Debería mostrar JSON con los datos
```

### Ver Logs (si hay error):
En Vercel Dashboard:
```
Deployment → Logs
```

---

## 🐛 Troubleshooting Común

### Error: "Cannot find database"
**Solución**: DATABASE_URL no está configurada en Vercel
1. Ve a Settings → Environment Variables
2. Verifica que DATABASE_URL está ahí
3. Haz Redeploy (click botón "Redeploy")

### Error: "No such table"
**Solución**: Las migraciones no se ejecutaron
```bash
# Desde tu terminal local:
npm run db:push
git add . && git commit -m "fix: sync db"
git push
# Vercel redeploy automáticamente
```

### Datos vacíos
**Solución**: No ejecutaste db:seed
```bash
npm run db:seed
```

### 504 Gateway Timeout
**Solución**: Es común en primer deploy. Espera 30 segundos y refresca.

---

## ✅ Checklist Final

- [ ] Crear proyecto en Neon
- [ ] Copiar DATABASE_URL
- [ ] Crear `.env.local` localmente
- [ ] `npm run db:push`
- [ ] `npm run db:seed`
- [ ] `npm run dev` y verificar
- [ ] Subir a GitHub
- [ ] Crear proyecto en Vercel
- [ ] Añadir DATABASE_URL en env vars
- [ ] Deploy
- [ ] Verificar URL pública funciona
- [ ] Revisar `/api/disciplines/futbol-5`

---

## 🔗 URLs Útiles

| Servicio | URL |
|----------|-----|
| Neon | https://neon.tech |
| Vercel | https://vercel.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Neon Dashboard | https://neon.tech/app |

---

## 🎯 Resumen

```
Neon      → Base de datos PostgreSQL en la nube
Vercel    → Hosting del servidor Next.js
Tu App    → Conecta a Neon usando DATABASE_URL
```

**¡Eso es todo!** Tu app estará en vivo en ~20 minutos.

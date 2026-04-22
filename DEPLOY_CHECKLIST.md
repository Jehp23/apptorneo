# 📋 Checklist de Deploy Vercel + Neon

## ✅ Pre-Deployment (5 min)

- [ ] Crear cuenta en [neon.tech](https://neon.tech)
- [ ] Crear nuevo proyecto PostgreSQL
- [ ] Copiar `DATABASE_URL` (string de conexión)
- [ ] Crear `.env.local` con la URL
- [ ] Ejecutar `npm install`

## ✅ Validar Localmente (10 min)

```bash
# En la terminal del proyecto:
npm run db:push          # Sincronizar schema
npm run db:seed          # Cargar datos de ejemplo
npm run dev              # Iniciar servidor local
```

- [ ] Verificar en http://localhost:3000
- [ ] Comprobar que se ven los datos del torneo
- [ ] Revisar que `/api/disciplines/futbol-5` retorna datos

## ✅ Subir a GitHub (5 min)

```bash
git add .
git commit -m "feat: backend con Prisma y PostgreSQL"
git branch -M main
git remote add origin https://github.com/tu-usuario/repo.git
git push -u origin main
```

- [ ] Confirmar que está en GitHub
- [ ] `.env.local` no se subió (debe estar en `.gitignore`)
- [ ] Todos los archivos importantes están commiteados

## ✅ Configurar Vercel (10 min)

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click en "Import Git Repository"
3. Selecciona tu repo de GitHub
4. En Settings → Environment Variables:
   - [ ] Nombre: `DATABASE_URL`
   - [ ] Valor: Tu URL de Neon (desde `.env.local`)
   - [ ] Click Add

## ✅ Deploy Inicial (3 min)

- [ ] Click en "Deploy"
- [ ] Esperar a que termine (2-3 min)
- [ ] Vercel ejecutará automáticamente `npm run db:push`

## ✅ Verificar Deploy (5 min)

```bash
# En tu navegador:
# https://tu-app.vercel.app
# https://tu-app.vercel.app/api/disciplines/futbol-5
```

- [ ] URL de Vercel funciona
- [ ] Se ven los datos del torneo
- [ ] APIs retornan JSON correcto
- [ ] No hay errores en `vercel logs`

## ✅ Solucionar Problemas (Si es necesario)

### Error: "Cannot find database"
```bash
# Vercel terminal:
vercel env pull                    # Obtener vars
npm run db:push                    # Forzar migración
npm run db:seed                    # Cargar datos
```

### Error: "DATABASE_URL is not defined"
```bash
# Vercel Dashboard → Settings → Environment Variables
# Verifica que DATABASE_URL está ahí
# Redeploy: Click el botón "Redeploy"
```

### Error: "No such table"
```bash
# Las migraciones no se ejecutaron
# En Vercel Dashboard → redeploy o:
vercel env pull
npm run db:push
vercel deploy --prod
```

## 📊 Monitoreo Post-Deploy

- [ ] Revisar logs: `vercel logs`
- [ ] Probar todas las disciplinas cargando
- [ ] Verificar que `/api/tournaments` devuelve datos
- [ ] Comprobar que `/admin/disciplines` funciona

## 🔒 Seguridad

- [ ] `DATABASE_URL` está en Vercel Env Vars (nunca en código)
- [ ] `.env.local` está en `.gitignore` 
- [ ] No hay secretos en commits
- [ ] Neon tiene acceso desde Vercel (IP whitelist)

## 📱 Testing en Producción

```bash
# Desde tu terminal local:
curl https://tu-app.vercel.app/api/tournaments
curl https://tu-app.vercel.app/api/disciplines/futbol-5
```

- [ ] APIs responden
- [ ] Datos son accesibles
- [ ] No hay errores CORS

## 🎉 ¡Listo!

Si pasaste todos los checkboxes:

✅ **Tu app está en vivo en Vercel**
✅ **Base de datos en Neon PostgreSQL**
✅ **APIs funcionando**
✅ **Backend en producción**

### Próximo Paso: Panel de Admin

Para que el admin pueda actualizar resultados, crea una página:

```typescript
// app/admin/page.tsx
export default function AdminPanel() {
  // Mostrar torneos y disciplinas
  // Formulario para actualizar resultados
  // Crear equipos y jugadores
}
```

---

**¿Necesitas ayuda?** Revisa:
- [STATUS.md](./STATUS.md) - Resumen técnico
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía detallada
- [QUICKSTART.md](./QUICKSTART.md) - 5 minutos de setup

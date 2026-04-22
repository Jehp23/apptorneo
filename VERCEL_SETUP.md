# 🚀 DEPLOY EN VERCEL - PASO A PASO

## Estado Actual
✅ GitHub: Todo pusheado a https://github.com/Jehp23/apptorneo
✅ Base de datos: PostgreSQL en Neon, sincronizada y con datos
✅ Backend: APIs funcionando
✅ Listo para: Vercel

---

## 🎯 Deploy en Vercel (3 minutos)

### PASO 1: Ir a Vercel
```
https://vercel.com/new
```

### PASO 2: Importar Repositorio
1. Haz click en: **"Import Git Repository"**
2. Busca: **`Jehp23/apptorneo`**
3. Click en el proyecto
4. Click en: **"Import"**

### PASO 3: Configurar Variables de Ambiente ⚠️ IMPORTANTE
En la página de configuración del proyecto:

1. Scroll hasta: **"Environment Variables"**

2. Haz click en: **"Add Environment Variable"**

3. Completa así:
   ```
   Name:  DATABASE_URL
   Value: postgresql://neondb_owner:npg_sIyn7WRp6kGu@ep-shy-field-amslqh2h-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. Click en: **"Add Another"** (Opcional - para futuro)
   ```
   Name:  NEXT_PUBLIC_API_URL
   Value: (Se llenará automático con tu URL de Vercel)
   ```

5. Click en: **"Deploy"** (Botón azul grande)

### PASO 4: Esperar Deploy
Vercel hará automáticamente:
1. ✅ Clonar el repo
2. ✅ Instalar dependencias (`npm install`)
3. ✅ Generar Prisma Client (`prisma generate`)
4. ✅ Sincronizar BD (`prisma db push`)
5. ✅ Compilar Next.js (`next build`)

⏱️ Tiempo: 2-3 minutos

### PASO 5: Verificar

Cuando veas: **"Deployment complete"** ✅

Click en la URL (ej: `https://apptorneo.vercel.app`)

Debería verse igual que localmente:
- http://apptorneo.vercel.app
- http://apptorneo.vercel.app/futbol5
- http://apptorneo.vercel.app/api/disciplines/futbol-5

---

## ✅ Verificación Post-Deploy

### 1. En el navegador:
```
https://apptorneo.vercel.app
```
Debería verse: Logo, disciplinas, etc.

### 2. Probar API:
```
https://apptorneo.vercel.app/api/disciplines/futbol-5
```
Debería retornar JSON con los datos del torneo

### 3. Ver logs (si hay error):
En Vercel Dashboard:
- Click en el proyecto
- **Deployments** → **Logs**

---

## 🐛 Troubleshooting

### Error: "Cannot find database"
```
Solución:
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica que DATABASE_URL está configurada
3. Click "Redeploy"
```

### Error: "No such table: Tournament"
```
Solución:
Las migraciones no se ejecutaron. 
Vercel debería ejecutarlas automáticamente pero:
1. Go a: Vercel Dashboard → Deployments
2. Click en el último deploy
3. Scroll a "Logs" y busca si está el error
4. Si falta db:push, puedes:
   - Click "Redeploy" (intenta de nuevo)
   - O redeployar manualmente
```

### Datos vacíos
```
Solución:
El seed no se ejecutó automáticamente. Esto es normal.
Los datos SÍ están en la BD (se cargaron localmente).
Si ves estructura pero sin datos:
1. Los datos están en tu Neon
2. Prueba hacer refresh (Ctrl+F5)
3. Si aún no ves, revisa los logs de Vercel
```

---

## 📊 URLs Finales

Una vez deployed, tendrás:

| Recurso | URL |
|---------|-----|
| App Principal | https://apptorneo.vercel.app |
| Futbol 5 | https://apptorneo.vercel.app/futbol5 |
| API Disciplinas | https://apptorneo.vercel.app/api/disciplines |
| API Futbol 5 | https://apptorneo.vercel.app/api/disciplines/futbol-5 |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 🔄 Actualizar Después (GitHub → Vercel)

Cualquier cambio que hagas:

```bash
git add .
git commit -m "feat: tu cambio"
git push origin main
```

Vercel redeploy automáticamente en segundos.

---

## ✨ Después del Deploy

### Admin Panel (Próximo)
Necesitarás crear una página para:
- Crear torneos
- Crear disciplinas
- Subir equipos y jugadores
- Actualizar resultados en vivo

### Autenticación (Recomendado)
Para proteger las APIs de admin:
- NextAuth.js
- Clerk
- Auth0

### WebSockets (Opcional)
Para actualizaciones en tiempo real cuando se actualizan resultados.

---

## 🆘 Soporte

Si algo falla en Vercel:

1. **Revisa los logs**: Vercel Dashboard → Logs
2. **DATABASE_URL**: ¿Está la variable correcta?
3. **Red Deploy**: Click "Redeploy" (a veces funciona)
4. **Reiniciar**: En Vercel Settings → Redeploy all deployments

---

**Listo para completar el setup. ¿Vamos con Vercel?** 🚀

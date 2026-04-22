#!/bin/bash
# Script para ejecutar migraciones de Prisma en Vercel
# Se ejecuta automáticamente en el build command

echo "🔄 Generando Prisma Client..."
npx prisma generate

echo "📊 Aplicando migraciones a PostgreSQL..."
npx prisma db push --skip-generate

echo "✅ Migraciones completadas"

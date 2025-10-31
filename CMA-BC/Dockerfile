# --- ETAPA 1: Builder ---
# Usamos una imagen completa de Node.js para instalar dependencias.
# 'AS builder' le da un nombre a esta etapa.
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos primero package.json y package-lock.json
# Esto aprovecha el caché de Docker. Si estos archivos no cambian,
# Docker no volverá a ejecutar 'npm install'.
COPY package*.json ./

# Instalamos solo las dependencias de producción
RUN npm install --only=production

# --- ETAPA 2: Runner ---
# Ahora usamos una imagen súper ligera para la ejecución final.
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Creamos un usuario no-root por seguridad.
# -S: crea un usuario del sistema, -G: lo añade a un grupo.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copiamos las dependencias instaladas desde la etapa 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copiamos el resto de nuestro código de la aplicación (src, prisma, etc.)
COPY . .

# El cliente de Prisma debe ser generado dentro del entorno final
# porque puede depender de binarios del sistema operativo.
RUN npx prisma generate

# Cambiamos al usuario no-root que creamos
USER nodejs

# Exponemos el puerto en el que correrá nuestra aplicación
EXPOSE 3000

# El comando que se ejecutará cuando el contenedor inicie
CMD [ "node", "src/server.js" ]
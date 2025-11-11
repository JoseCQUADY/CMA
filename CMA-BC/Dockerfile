# ---- Etapa 1: Builder ----
# En esta etapa instalamos TODAS las dependencias (incluidas las de desarrollo)
# y generamos los artefactos necesarios como el cliente de Prisma.
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos TODAS las dependencias, incluidas las devDependencies para poder usar Prisma CLI
RUN npm install

# Copiamos el resto del código, incluyendo el schema de Prisma
COPY . .

# Generamos el cliente de Prisma
# Si no usas Prisma, puedes eliminar esta línea
RUN npx prisma generate

# ---- Etapa 2: Runner (Producción) ----
# Esta es la imagen final, será mucho más ligera porque no contendrá
# las devDependencies ni el código fuente completo que no sea necesario.
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# El usuario 'node' ya existe en la imagen base con UID/GID 1000.
# Nos aseguramos que el directorio de la app le pertenezca.
# Esto soluciona los problemas de permisos con los volúmenes montados.
RUN chown -R node:node /usr/src/app

# Establecemos que los siguientes comandos se ejecuten como el usuario 'node'
USER node

# Copiamos solo los archivos de dependencias de producción
COPY --chown=node:node package*.json ./

# Instalamos SOLAMENTE las dependencias de producción para mantener la imagen ligera
RUN npm install --only=production

# Copiamos el código de la aplicación
COPY --chown=node:node . .

# --- COPIA DESDE LA ETAPA 'builder' ---
# Copiamos el cliente de Prisma generado desde la etapa de 'builder'
# Esto es crucial para que la aplicación de producción lo pueda usar.
# Si no usas Prisma, puedes eliminar esta línea.
COPY --chown=node:node --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma


# Exponemos el puerto que usa nuestra aplicación
EXPOSE 3000

# El comando para iniciar la aplicación en producción
# Asegúrate de que 'src/index.js' sea tu punto de entrada principal
CMD [ "sh", "-c", "sleep 2 && node src/server.js" ]

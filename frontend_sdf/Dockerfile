# Usa imagen oficial de Node.js
FROM node:18

# Crea carpeta de trabajo
WORKDIR /app

# Copia solo archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia solo el código fuente (excluyendo node_modules)
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]

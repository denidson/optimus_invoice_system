# Usa imagen oficial de Node.js
FROM node:18

# Crea carpeta de trabajo
WORKDIR /app

# Copia dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]

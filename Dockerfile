FROM node:20
WORKDIR /app

# Nur das, was nötig ist (node_modules auslassen)
COPY package*.json ./
RUN npm install

COPY . .

# Port wie in server.js (z. B. 3000)
EXPOSE 6666

CMD ["node", "server.js"]

FROM node:10.19.0

WORKDIR /
COPY package*.json ./
RUN npm install 
COPY . .
CMD ["node", "app.js"]
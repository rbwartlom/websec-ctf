# build backend
FROM node:20-alpine as backend-build

WORKDIR /app
RUN mkdir ./dist

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .
RUN npm run build-swagger

# build frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .

RUN npm run build

# start backend
FROM backend-build
WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "run", "start"]

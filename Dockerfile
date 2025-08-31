# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# Etapa 2: Runtime (Node)
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 4001
CMD ["node", "dist/moope/server/server.mjs"]

# Stage 1: Development (The "base" for dev)
FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The dev server runs on 3000
EXPOSE 3000
CMD ["npm", "start"]

# Stage 2: Builder (For production - ignored during dev)
FROM development AS builder
RUN npm run build

# Stage 3: Production (The Nginx stage - ignored during dev)
FROM nginx:alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
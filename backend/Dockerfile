# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (including dev) for the TypeScript build
COPY package*.json ./
RUN npm ci

# Compile TS -> dist/
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production deps in the final image
COPY package*.json ./
RUN npm ci --omit=dev

# Bring over the compiled output
COPY --from=build /app/dist ./dist

# API listens on PORT (defaults to 3000 in code)
EXPOSE 3000
CMD ["node", "dist/index.js"]

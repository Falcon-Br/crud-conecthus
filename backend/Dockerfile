FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace backend --include-workspace-root=false --no-audit --no-fund
COPY backend ./backend
RUN npm run build --workspace backend

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --omit=dev --omit=optional --workspace backend --include-workspace-root=false --no-audit --no-fund \
    && npm cache clean --force
COPY --from=build --chown=node:node /app/backend/dist ./backend/dist
COPY --chown=node:node backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
WORKDIR /app/backend
USER node
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]

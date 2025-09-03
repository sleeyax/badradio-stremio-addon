ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY src ./src
# Build and remove dev dependencies to shrink final image
RUN npm run build && npm prune --omit=dev

FROM node:${NODE_VERSION}
WORKDIR /app
ENV NODE_ENV=production \
    PORT=7000
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 7000
LABEL org.opencontainers.image.title="badradio-stremio-addon" \
      org.opencontainers.image.description="Stremio addon providing badradio 24/7 with current track metadata" \
      org.opencontainers.image.source="https://github.com/sleeyax/badradio-stremio-addon" \
      org.opencontainers.image.licenses="MIT"
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/manifest.json >/dev/null || exit 1
USER node
ENTRYPOINT ["node", "dist/index.js"]

FROM node:22-alpine

WORKDIR /app
COPY platform/package.json platform/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY platform/src ./src

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:4000/healthz >/dev/null || exit 1
CMD ["node", "src/server.mjs"]

FROM node:24-alpine

WORKDIR /app
COPY platform/package.json platform/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY platform/src ./src
# Named volumes inherit this ownership on first creation, so the non-root user can write the database.
RUN mkdir -p /data && chown node:node /data

USER node
ENV PLATFORM_DATA_DIR=/data
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:4000/healthz >/dev/null || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.mjs"]

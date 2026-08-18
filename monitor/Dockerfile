FROM node:22-alpine

WORKDIR /app
COPY monitor/server.mjs ./server.mjs

USER node
EXPOSE 3000
CMD ["node", "server.mjs"]

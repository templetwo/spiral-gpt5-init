# Spiral MCP server container
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY tsconfig.json .
COPY src ./src
RUN npm run build && npm prune --production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]

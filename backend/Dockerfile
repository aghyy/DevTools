FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 5039

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

# Imagem do servidor de UMA instalação. O mesmo código serve todos os clientes; só o .env muda.
# Construir na raiz do repositório:  docker build -f deploy/Dockerfile -t up-merchant-server:latest .
FROM node:24-alpine
RUN apk add --no-cache tar rclone tzdata
ENV TZ=America/Sao_Paulo NODE_ENV=production
WORKDIR /app
COPY package.json ./package.json
COPY server ./server
COPY packages/merchant-core/src ./packages/merchant-core/src
COPY deploy/backup-loop.sh ./deploy/backup-loop.sh
USER node
EXPOSE 3001
CMD ["node", "server/src/index.js"]

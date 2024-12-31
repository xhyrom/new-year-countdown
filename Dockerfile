FROM oven/bun:latest

COPY .env ./
COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun install

ENTRYPOINT [ "bun", "run", "index.js" ]

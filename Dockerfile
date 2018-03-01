FROM node:9-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN NODE_ENV=production yarn --no-progress --non-interactive \
    && rm -rf ~/.cache/yarn

COPY worker.js ./

CMD ["node", "worker.js"]

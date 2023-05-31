FROM node:18.16.0 as builder
WORKDIR /src
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:stable
COPY --from=builder /src/out /data/www
COPY nginx.conf /etc/nginx/
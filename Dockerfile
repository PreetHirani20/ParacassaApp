FROM node:14 AS builder
WORKDIR /app
COPY . /app
RUN npm install && npm run build

FROM nginx
WORKDIR /app
COPY --from=builder /app/dist /app
RUN ls
Copy nginx.conf /etc/nginx/conf.d/default.conf
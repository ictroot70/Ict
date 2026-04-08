#Устанавливаем зависимости
FROM node:20.11-alpine as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

#Билдим приложение
#Кэширование зависимостей — если файлы в проекте изменились,
#но package.json остался неизменным, то стейдж с установкой зависимостей повторно не выполняется, что экономит время.
FROM node:20.11-alpine as builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build:production

#Стейдж запуска
FROM node:20.11-alpine as runner
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY --from=builder /app/ ./
EXPOSE 3000
CMD ["npm", "start"]

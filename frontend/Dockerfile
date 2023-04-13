# Build stage
FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8029

CMD ["npm", "run", "dev"]

# # Production stage
# FROM nginx:alpine

# COPY nginx.conf /etc/nginx/nginx.conf

# COPY --from=build /app/dist /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
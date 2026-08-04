# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app
# Copy the entire root context (assets + website)
COPY . .
# Navigate into website to run the build
WORKDIR /app/website
RUN npm ci
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/website/dist /usr/share/nginx/html
# Note: nginx.conf is inside the website folder in the root context
COPY website/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

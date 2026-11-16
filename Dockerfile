# Frontend para la VPS: build con Vite y nginx sirviendo dist/.
# Vercel sigue usando vercel.json; este archivo no lo afecta.

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite incrusta las VITE_* en el bundle al compilar: van como build args
# (GitHub Actions), no como variables del contenedor.
ARG VITE_API_URL
ARG VITE_APP_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_ENV=production
ARG VITE_BLOCKCHAIN_NETWORK
ARG VITE_CONTRACT_ADDRESS_POLYGON
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_API_URL=$VITE_APP_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_BLOCKCHAIN_NETWORK=$VITE_BLOCKCHAIN_NETWORK \
    VITE_CONTRACT_ADDRESS_POLYGON=$VITE_CONTRACT_ADDRESS_POLYGON

RUN pnpm run build

FROM nginx:1.27-alpine
ENV BACKEND_UPSTREAM=http://backend:3000 \
    NGINX_RESOLVER=127.0.0.11
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/headers.conf /etc/nginx/snippets/headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy the start script into the runner image
COPY --from=builder /app/start.sh ./start.sh

# Give the container permission to execute the script
RUN chmod +x ./start.sh

EXPOSE 3000

# Execute the script to run both worker and web app simultaneously
CMD ["./start.sh"]

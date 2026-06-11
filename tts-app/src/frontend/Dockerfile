# ── Stage: serve static files with Nginx ───────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy our frontend files
COPY src/ /usr/share/nginx/html/

# Nginx config that supports SPA routing and proxies /api to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

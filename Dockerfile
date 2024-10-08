FROM node:22.2-slim AS build
WORKDIR /app
COPY client/package.json client/yarn.lock .
RUN ["yarn", "install", "--frozen-lockfile"]
COPY client .
RUN ["yarn", "build"]

FROM robustadev/krr:v1.13.0 AS final
COPY server.py .
COPY --from=build /app/dist .
CMD ["python", "server.py", "simple"]
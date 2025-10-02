# --- build stage ---
FROM golang:1.22-alpine AS build
WORKDIR /src

# Опционально: ускорить сборку
RUN apk add --no-cache git ca-certificates

# Копируем go.mod/sum отдельно для layer caching
COPY backend/go.mod backend/go.sum ./backend/
WORKDIR /src/backend
RUN go mod download

# Копируем остальной код
COPY backend/ /src/backend/

ENV CGO_ENABLED=0 GOOS=linux
RUN go build -o /out/server ./cmd/server

# --- minimal runtime ---
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=build /out/server /app/server
USER nonroot:nonroot

ENV PORT=8080

ENTRYPOINT ["/app/server"]
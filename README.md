# API Gateway 

Satu pintu masuk (port 3000) untuk dua service music-api: GraphQL (8080) dan gRPC (50051), dengan rate limiting.

| Gateway (port 3000) | Diteruskan ke |
|---|---|
| POST /graphql | GraphQL music-api, http://localhost:8080/graphql (reverse proxy) |
| GET /grpc/lagu/:id | gRPC LaguService.GetLagu di localhost:50051 (REST -> gRPC) |
| GET /health | dijawab gateway |

## Menjalankan
1. Jalankan music-api: `go run .` (HTTP 8080 dan gRPC 50051)
2. `npm install` lalu `npm start`
(Tanpa database: `npm run mock` menjalankan tiruan kedua service.)

Env: `GRAPHQL_URL`, `GRPC_ADDR`, `RATE_LIMIT_MAX` (default 5), `RATE_LIMIT_WINDOW_MS` (default 60000).

## Postman
- POST http://localhost:3000/graphql, Body raw JSON: `{"query":"{ lagu { id judul } }"}`
- GET http://localhost:3000/grpc/lagu/1

## Uji rate limiting
Restart gateway (reset hitungan), lalu `npm run test:ratelimit`.

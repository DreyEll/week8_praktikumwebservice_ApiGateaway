const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PORT = 3000;

const GRAPHQL_URL =
  "http://127.0.0.1:8080";

const GRPC_ADDR =
  "127.0.0.1:50051";

const LIMIT = 5;

const WINDOW_MS = 60000;

// ===============================
// gRPC CLIENT
// ===============================

const PROTO_PATH = path.join(
  __dirname,
  "..",
  "grpc-service",
  "lagu.proto"
);

const def = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    defaults: true
  }
);

const music =
  grpc.loadPackageDefinition(def).music;

const laguClient =
  new music.LaguService(
    GRPC_ADDR,
    grpc.credentials.createInsecure()
  );

// ===============================
// EXPRESS
// ===============================

const app = express();

// ===============================
// RATE LIMIT
// ===============================

app.use(
  rateLimit({
    windowMs: WINDOW_MS,

    limit: LIMIT,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
      res.status(429).json({
        error: "Too Many Requests",

        message:
          `Batas ${LIMIT} request per ` +
          `${WINDOW_MS / 1000} detik terlampaui.`
      });
    }
  })
);

// ===============================
// HEALTH CHECK
// ===============================

app.get(
  "/health",
  (req, res) => {
    res.json({
      status: "ok",
      gateway: true
    });
  }
);

// ===============================
// GRAPHQL SERVICE
// ===============================

app.use(
  "/graphql",

  createProxyMiddleware({
    target: GRAPHQL_URL,

    changeOrigin: true,

    pathRewrite: (path, req) => {
      return "/graphql";
    }
  })
);

// ===============================
// gRPC SERVICE
// REST -> gRPC
// ===============================

app.get(
  "/grpc/lagu/:id",

  (req, res) => {

    const id =
      parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "id harus angka"
      });
    }

    laguClient.GetLagu(
      { id },

      (err, lagu) => {

        if (err) {

          let status = 500;

          if (
            err.code ===
            grpc.status.NOT_FOUND
          ) {
            status = 404;
          }

          if (
            err.code ===
            grpc.status.UNAVAILABLE
          ) {
            status = 503;
          }

          return res.status(status).json({
            error:
              err.details ||
              err.message
          });
        }

        res.json(lagu);
      }
    );
  }
);

// ===============================
// ROUTE TIDAK DITEMUKAN
// ===============================

app.use(
  (req, res) => {

    res.status(404).json({
      error:
        "Route tidak ditemukan di gateway"
    });

  }
);

// ===============================
// START
// ===============================

app.listen(
  PORT,

  () => {

    console.log(
      `Gateway berjalan di http://localhost:${PORT}`
    );

    console.log(
      `/graphql -> ${GRAPHQL_URL}/graphql`
    );

    console.log(
      `/grpc/lagu/:id -> gRPC ${GRPC_ADDR}`
    );

    console.log(
      `Rate limit: ${LIMIT} request / ${
        WINDOW_MS / 1000
      } detik`
    );

  }
);
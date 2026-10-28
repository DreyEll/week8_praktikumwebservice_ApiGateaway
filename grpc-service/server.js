const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "lagu.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const musicProto =
  grpc.loadPackageDefinition(packageDefinition).music;

const lagu = [
  {
    id: 1,
    judul: "bad",
    album_id: 1
  },
  {
    id: 2,
    judul: "peach eyes",
    album_id: 1
  },
  {
    id: 3,
    judul: "midnight",
    album_id: 2
  }
];

function getLagu(call, callback) {
  const id = Number(call.request.id);

  const data = lagu.find(item => item.id === id);

  if (!data) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: "Lagu tidak ditemukan"
    });
  }

  callback(null, data);
}

const server = new grpc.Server();

server.addService(
  musicProto.LaguService.service,
  {
    GetLagu: getLagu
  }
);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log(
      `gRPC Service berjalan di port ${port}`
    );
  }
);
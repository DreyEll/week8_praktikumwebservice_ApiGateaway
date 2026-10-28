const axios = require("axios");

const BASE_URL =
  "http://localhost:3000";

async function test(name, config) {

  try {

    const response = await axios({
      ...config,

      validateStatus:
        () => true
    });

    console.log(
      `${name}: ${response.status}`
    );

    console.log(
      response.data
    );

    console.log("-------------------------");

    return response;

  } catch (error) {

    console.log(
      `${name}: ERROR`
    );

    console.log(
      error.message
    );

  }
}

async function main() {

  console.log(
    "===== SMOKE TEST ====="
  );

  // Gateway
  await test(
    "Gateway Health",
    {
      method: "GET",
      url: `${BASE_URL}/health`
    }
  );

  // GraphQL
  await test(
    "GraphQL Service",
    {
      method: "POST",

      url:
        `${BASE_URL}/graphql`,

      headers: {
        "Content-Type":
          "application/json"
      },

      data: {
        query:
          "{ lagu { id judul album_id } }"
      }
    }
  );

  // gRPC
  await test(
    "gRPC Service",
    {
      method: "GET",

      url:
        `${BASE_URL}/grpc/lagu/1`
    }
  );

  console.log(
    "\n===== FAILURE TEST ====="
  );

  // Failure 1
  await test(
    "Failure 1 - ID bukan angka",
    {
      method: "GET",

      url:
        `${BASE_URL}/grpc/lagu/abc`
    }
  );

  // Failure 2
  await test(
    "Failure 2 - Lagu tidak ditemukan",
    {
      method: "GET",

      url:
        `${BASE_URL}/grpc/lagu/999`
    }
  );

  // Failure 3
  console.log(
    "Failure 3 dilakukan dengan mematikan gRPC service."
  );

  console.log(
    "\n===== RATE LIMIT TEST ====="
  );

  for (
    let i = 1;
    i <= 8;
    i++
  ) {

    const response =
      await axios.get(
        `${BASE_URL}/grpc/lagu/1`,
        {
          validateStatus:
            () => true
        }
      );

    console.log(
      `Request ${i}: ${response.status}`
    );

  }
}

main();
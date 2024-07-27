import { describe, before, after, it } from "node:test";
import { deepStrictEqual, ok } from "node:assert";
import axios from "axios";

describe("API Workflow", () => {
  // Fastify instance
  let _server = {};

  before(async () => {
    _server = (await import("../server.js")).app;
    await new Promise((resolve) => _server.addHook("onReady", () => resolve()));
  });

  after(async () => {
    await _server.close();
  });

  it("should receive 400 given body without the prompt parameter", async () => {
    const data = {};

    const request = await fetch("http://localhost:3000/answer", {
      method: "POST",
      body: JSON.stringify(data),
    });

    deepStrictEqual(request.status, 400);
  });

  it("should receive 200 given the prompt in the body", async () => {
    const data = { prompt: "Olá! Gostaria de realizar um pedido :)" };

    const request = await axios
      .post("http://localhost:3000/answer", data)
      .catch((err) => console.log("err", err));
    const response =  request.data;

    if (response.message !== "Success" && !response.data.answer)
      throw new Error("Invalid response body");

    deepStrictEqual(request.status, 200);
  });
});

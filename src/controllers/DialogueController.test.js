import { describe, before, after, it } from "node:test";
import { deepStrictEqual, ok } from "node:assert";

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
    const requestData = { prompt: "How you are?" };

    const request = await fetch("http://localhost:3000/answer", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    deepStrictEqual(request.status, 200);

    const responseData = JSON.parse(request.body);
    if (responseData.message !== "Success" && !responseData.data.answer)
      throw new Error("Invalid response body");
  });
});

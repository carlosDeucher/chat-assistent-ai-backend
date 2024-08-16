import { describe, before, after } from "node:test";
import chatControllerTests from "./controllers/ChatController.js";

const testFunctions = [chatControllerTests];

describe("API Workflow", function () {
  // Fastify instance
  this._server = {};

  before(async () => {
    this._server = (await import("./server.js")).app;
    await new Promise((resolve) =>
      this._server.addHook("onReady", () => resolve())
    );
  });

  after(async () => {
    await this._server.close();
  });

  for (const testFn of testFunctions) {
    testFn.call(this);
  }
});

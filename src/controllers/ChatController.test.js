import axios from "axios";
import { deepStrictEqual } from "node:assert";
import { it, skip } from "node:test";

("use strict");
export default function dialogueControllerTests() {
  it("should receive 400 given body without the prompt parameter", async () => {
    const data = {};

    const request = await fetch("http://localhost:3000/answer", {
      method: "POST",
      body: JSON.stringify(data),
    });

    deepStrictEqual(request.status, 400);
  });

  it("should receive 200 given the prompt in the body", async () => {
    return skip();

    const data = { prompt: "Olá! Gostaria de realizar um pedido :)" };

    const request = await axios
      .post("http://localhost:3000/answer", data)
      .catch((err) => console.log("err", err));
    const response = request.data;

    if (response.message !== "Success" && !response.data.answer)
      throw new Error("Invalid response body");

    deepStrictEqual(request.status, 200);
  });
}

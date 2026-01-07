import request from "supertest";
import app from "../server.js";

describe("Auth routes", () => {
  it("GET /api/ping returns pong", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("pong");
  });
});

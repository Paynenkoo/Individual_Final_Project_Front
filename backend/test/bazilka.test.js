import request from "supertest";
import app from "../server.js";

describe("Bazilka list", () => {
  it("GET /api/bazilka returns 200", async () => {
    const res = await request(app).get("/api/bazilka?limit=1");
    expect([200,204]).toContain(res.status); // якщо порожньо або є дані
  });
});

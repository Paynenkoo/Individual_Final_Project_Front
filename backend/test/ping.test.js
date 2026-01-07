import request from "supertest";
import app from "../server.js"; 

describe("GET /api/ping", () => {
  it("should return pong", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.text).toBe("pong");
  });
});
export default app;

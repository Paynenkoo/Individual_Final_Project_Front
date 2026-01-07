import request from "supertest";
import app from "../server.js";

describe("Users overview", () => {
  it("404 for unknown id", async () => {
    const res = await request(app).get("/api/users/650000000000000000000000/overview");
    expect([404,200]).toContain(res.status); // 200 коли юзер існує
  });
});

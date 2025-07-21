import request from "supertest";
import app from "../src/server";
import { describe, it, expect} from "@jest/globals";

describe("GET /api/health", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

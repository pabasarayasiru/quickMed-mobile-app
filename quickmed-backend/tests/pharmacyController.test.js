import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import pharmacyRouter from "../routes/pharmacyRoutes.js"; 

const app = express();
app.use(bodyParser.json());
app.use("/pharmacy", pharmacyRouter);

describe("Search Stock API", () => {
  const testPharmacyId = "f2pYnnSxQGNwszhjF6G9BjHgOWw2";

  it("should return search results for a valid medicine name", async () => {
    const res = await request(app)
      .get(`/pharmacy/${testPharmacyId}/stock/search`)
      .query({ name: "Panadol" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);

    // If you know a medicine exists, you can check:
    // expect(res.body.results[0].name).toMatch(/panadol/i);
  });

  it("should return empty array if no medicine matches", async () => {
    const res = await request(app)
      .get(`/pharmacy/${testPharmacyId}/stock/search`)
      .query({ name: "NoSuchMedicine" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.results).toEqual([]);
  });

  it("should return 400 if name is missing", async () => {
    const res = await request(app)
      .get(`/pharmacy/${testPharmacyId}/stock/search`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing search name");
  });
});

import { cosineSimilarity } from "../utils/ai";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6);
  });

  it("returns 1 for parallel vectors (same direction, different magnitude)", () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 6);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 6);
  });

  it("computes a known similarity value", () => {
    // [1,2,3] . [4,5,6] = 32 ; |a| = sqrt(14), |b| = sqrt(77)
    // 32 / (sqrt(14)*sqrt(77)) = 0.974631...
    expect(cosineSimilarity([1, 2, 3], [4, 5, 6])).toBeCloseTo(0.974631846, 6);
  });

  it("returns 0 when vectors have different lengths", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2])).toBe(0);
  });

  it("returns 0 for an empty vector", () => {
    expect(cosineSimilarity([], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [])).toBe(0);
  });

  it("returns 0 when one vector is all zeros (no division by zero)", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it("is symmetric: sim(a,b) === sim(b,a)", () => {
    const a = [0.2, -0.5, 0.9, 0.1];
    const b = [0.7, 0.3, -0.2, 0.6];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 12);
  });

  it("stays within the valid [-1, 1] range for arbitrary input", () => {
    const score = cosineSimilarity([3, -1, 4, 1, 5], [9, 2, -6, 5, 3]);
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });
});

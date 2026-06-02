import { signupSchema, signinSchema, firstError } from "../utils/validation";

describe("signupSchema", () => {
  it("accepts a valid username + strong password", () => {
    const r = signupSchema.safeParse({ username: "jeetu", password: "Str0ng@Pass" });
    expect(r.success).toBe(true);
  });

  it("rejects a username shorter than 3 chars", () => {
    const r = signupSchema.safeParse({ username: "ab", password: "Str0ng@Pass" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toBe("Username must be 3-10 characters");
  });

  it("rejects a username longer than 10 chars", () => {
    const r = signupSchema.safeParse({ username: "waytoolongusername", password: "Str0ng@Pass" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toBe("Username must be 3-10 characters");
  });

  it("rejects a weak password (no uppercase/number/special)", () => {
    const r = signupSchema.safeParse({ username: "jeetu", password: "password" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toMatch(/Password must be 8-20 characters/);
  });

  it("rejects a missing password with the combined message", () => {
    const r = signupSchema.safeParse({ username: "jeetu" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toBe("Username and password are required");
  });
});

describe("signinSchema", () => {
  it("accepts any non-empty username + password", () => {
    const r = signinSchema.safeParse({ username: "jeetu", password: "whatever" });
    expect(r.success).toBe(true);
  });

  it("rejects empty credentials", () => {
    const r = signinSchema.safeParse({ username: "", password: "" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toBe("Username and password are required");
  });

  it("rejects a missing username", () => {
    const r = signinSchema.safeParse({ password: "whatever" });
    expect(r.success).toBe(false);
    expect(firstError(r)).toBe("Username and password are required");
  });
});

describe("firstError", () => {
  it("returns null for a successful parse", () => {
    const r = signinSchema.safeParse({ username: "jeetu", password: "whatever" });
    expect(firstError(r)).toBeNull();
  });
});

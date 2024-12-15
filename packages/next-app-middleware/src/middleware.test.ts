import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { shortCircuitMiddleware } from "./middleware";

describe("shortCircuitMiddleware", () => {
  it("should return a NextResponse with next", () => {
    const result = shortCircuitMiddleware();
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.has("x-middleware-next")).toBe(true);
  });
});

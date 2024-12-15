import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import createMiddleware from ".";

describe("createMiddleware", () => {
  let mockRequest: NextRequest;
  let mockEvent: NextFetchEvent;

  beforeEach(() => {
    mockRequest = new NextRequest("http://localhost:3000/test");
    mockEvent = {} as NextFetchEvent;
  });

  it("should return a function", () => {
    const middleware = createMiddleware([]);
    expect(typeof middleware).toBe("function");
  });

  it("should forward to the next request if no middleware is registered", async () => {
    const middleware = createMiddleware([]);
    const response = await middleware(mockRequest, mockEvent);
    expect(response).toBeDefined();
    expect(response.headers.has("x-middleware-next")).toBe(true);
  });

  it("should execute middleware when the path matches", async () => {
    const testMiddleware = vi.fn(() => {});
    const middleware = createMiddleware([["/test", testMiddleware]]);
    const response = await middleware(mockRequest, mockEvent);
    expect(testMiddleware).toHaveBeenCalled();
    expect(response).toBeDefined();
    expect(response.headers.has("x-middleware-next")).toBe(true);
  });

  it("should await async middleware", async () => {
    const testMiddleware = vi.fn(async () => {});
    const middleware = createMiddleware([["/test", testMiddleware]]);
    await middleware(mockRequest, mockEvent);
    expect(testMiddleware).toHaveBeenCalled();
    expect(testMiddleware).toHaveResolved();
  });

  it("should merge headers set in all middleware that matches the path", async () => {
    const anyMiddleware = vi.fn(({ response }) => {
      response.headers.set("x-any", "any");
    });
    const testMiddleware = vi.fn(({ response }) => {
      response.headers.set("x-test", "test");
    });
    const middleware = createMiddleware([
      ["{/*any}", anyMiddleware],
      ["/test", testMiddleware],
    ]);
    const response = await middleware(mockRequest, mockEvent);
    expect(response).toBeDefined();
    expect(response.headers.get("x-any")).toBe("any");
    expect(response.headers.get("x-test")).toBe("test");
  });

  it("should merge cookies set in all middleware that matches the path", async () => {
    const anyMiddleware = vi.fn(({ response }) => {
      response.cookies.set({ name: "any", value: "any" });
    });
    const testMiddleware = vi.fn(({ response }) => {
      response.cookies.set({ name: "test", value: "test" });
    });
    const middleware = createMiddleware([
      ["{/*any}", anyMiddleware],
      ["/test", testMiddleware],
    ]);
    const response = await middleware(mockRequest, mockEvent);
    expect(response).toBeDefined();
    expect(response.cookies.get("any")?.value).toBe("any");
    expect(response.cookies.get("test")?.value).toBe("test");
  });

  it("should return the response from the middleware that returns a response", async () => {
    const anyMiddleware = vi.fn(() => {});
    const testMiddleware = vi.fn(() => NextResponse.json({ test: "test" }));
    const middleware = createMiddleware([
      ["{/*any}", anyMiddleware],
      ["/test", testMiddleware],
    ]);
    const response = await middleware(mockRequest, mockEvent);
    const body = await response.text();
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(body).toBe('{"test":"test"}');
    expect(response.headers.has("x-middleware-next")).toBe(false);
  });

  it("should process all middleware for a path", async () => {
    const firstMiddleware = vi.fn(() => {});
    const secondMiddleware = vi.fn(() => {});
    const middleware = createMiddleware([
      ["/test", [firstMiddleware, secondMiddleware]],
    ]);
    await middleware(mockRequest, mockEvent);
    expect(firstMiddleware).toHaveBeenCalled();
    expect(secondMiddleware).toHaveBeenCalled();
  });
});

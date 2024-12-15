import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Match } from "path-to-regexp";
import { match } from "path-to-regexp";

export type MiddlewareFunctionContext = {
  request: NextRequest;
  response: NextResponse;
  event: NextFetchEvent;
  matchResult: Match<Record<string, string | string[] | undefined>>;
};

export type MiddlewareFunctionParameters = [MiddlewareFunctionContext];

type MiddlewareReturn = NextResponse | void;

export type MiddlewareFunction = (
  ...parameters: MiddlewareFunctionParameters
) => Promise<MiddlewareReturn> | MiddlewareReturn;

function combineResponses(
  applyTo: NextResponse,
  pullFrom: NextResponse
): NextResponse {
  pullFrom.headers.forEach((value, key) => {
    applyTo.headers.set(key, value);
  });
  pullFrom.cookies.getAll().forEach((cookie) => {
    applyTo.cookies.set(cookie);
  });
  return applyTo;
}

export function createMiddleware(
  pathMiddleware: [string, MiddlewareFunction | MiddlewareFunction[]][]
) {
  async function nextMiddleware(request: NextRequest, event: NextFetchEvent) {
    const response = new NextResponse();

    const executeMiddleware = async () => {
      for (const [path, middleware] of pathMiddleware) {
        const matchResult = match(path)(request.nextUrl.pathname);

        // if the path matches, execute the registered middleware for this path
        if (matchResult) {
          const normalizedMiddleware =
            typeof middleware === "function" ? [middleware] : middleware;
          for (const middleware of normalizedMiddleware) {
            const middlewareResult = await middleware({
              request,
              response,
              event,
              matchResult,
            });

            // stop processing this route if a middleware returns a response
            if (middlewareResult) {
              return combineResponses(middlewareResult, response);
            }
          }
        }
      }

      return combineResponses(NextResponse.next(), response);
    };

    return await executeMiddleware();
  }

  return nextMiddleware;
}

export default createMiddleware;

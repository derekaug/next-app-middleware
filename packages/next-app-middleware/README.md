# @derekaug/next-app-middleware

## Description

A library to help with the composition of middleware in Next.js v13+ when using the App router. Allows for path matching, middleware chaining, and inheritance of headers / cookies set in earlier middlewares.

Turn this:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/about")) {
    return NextResponse.rewrite(new URL("/about-2", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL("/dashboard/user", request.url));
  }
}
```

into this:

```ts
import { createMiddleware } from "@derekaug/next-app-middleware";

export const middleware = createMiddleware([
  [
    "/about{/*any}",
    ({ request }) => NextResponse.rewrite(new URL("/about-2", request.url)),
  ],
  [
    "/dashboard{/*any}",
    ({ request }) =>
      NextResponse.rewrite(new URL("/dashboard/user", request.url)),
  ],
]);
```

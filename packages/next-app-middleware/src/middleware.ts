import { NextResponse } from "next/server";

export const shortCircuitMiddleware = () => NextResponse.next();
